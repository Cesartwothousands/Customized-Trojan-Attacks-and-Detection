# organized code for scanning all datasets models using sliding anchors
import argparse
from turtle import position
from matplotlib import image
import torch
import torchvision
import os
import json
from tqdm import tqdm
from tqdm.contrib import itertools
import numpy as np
from torch import nn
import torch.backends.cudnn as cudnn
import time
from jsonargparse import ArgumentParser

cudnn.benchmark = True  # fire on all cylinders
from sklearn.metrics import roc_auc_score, roc_curve
import sys
from utils import load_data, BalancedBatchSampler
import random
import csv


class NetworkDatasetDetectionTest(torch.utils.data.Dataset):

    def __init__(self, model_folder):
        super().__init__()
        model_paths = []
        model_paths = [os.path.join(model_folder, x) for x in sorted(os.listdir(os.path.join(model_folder)))]

        # labels = []
        data_sources = []
        # target_labels = []
        # trigger_types = []
        model_ids = []
        # triggers = []
        for p in model_paths:
            with open(os.path.join(p, 'info.json'), 'r') as f:
                info = json.load(f)
                data_sources.append(info['dataset'])

            model_ids.append(p.split('/')[-1])

        self.model_paths = model_paths
        # self.labels = labels
        self.data_sources = data_sources
        # self.target_labels = target_labels
        # self.trigger_types = trigger_types
        self.model_ids = model_ids
        # self.triggers = triggers

    def __len__(self):
        return len(self.model_paths)

    def __getitem__(self, index):
        return torch.load(os.path.join(self.model_paths[index], 'model.pt')), \
               self.data_sources[index], self.model_ids[index]


def custom_collate(batch):
    return [x[0] for x in batch], [x[1] for x in batch], [
        x[2] for x in batch
    ]


def seed_torch(seed):
    random.seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.benchmark = False
    torch.backends.cudnn.deterministic = True


class AnchorScannear:

    def __init__(self, benign_ref_model_dirpath, data_source_to_num_classes, data_source_to_strides,
                 data_source_to_anchor_list, data_source_to_opt_steps):
        self.data_source_to_num_classes = data_source_to_num_classes
        self.data_source_to_strides = data_source_to_strides
        self.anchor_height_width_list = data_source_to_anchor_list
        self.data_source_to_opt_steps = data_source_to_opt_steps

        self.lr = 1e-1
        self.criterion = torch.nn.CrossEntropyLoss()

        self.pre_screening_benign_ref_models = []
        self.pre_screening_benign_ref_models_num = 10

        for i in range(self.pre_screening_benign_ref_models_num):
            bmodel = torch.load(
                os.path.join(benign_ref_model_dirpath, 'train/clean/id-{0:04d}/model.pt'.format(325 + i))).cuda().eval()
            # bmodel = torch.load('/data3/share/tdc_datasets_v2/detection/train/clean/id-{0:04d}/model.pt'.format(325+i)).cuda().eval()
            bmodel.eval()
            self.pre_screening_benign_ref_models.append(bmodel)

    def pre_screening(self, net):

        n_samples = 100
        n_classes = 43

        xs = (np.random.rand(n_samples * 43, 3, 32, 32, )) * 1.5
        # xs = ( np.random.randn(n_images*43,3,32,32,) * 0.3 + 0.5 ) * 1.5
        ys = np.zeros(n_samples * 43)

        for i in range(n_classes):
            ys[i * n_samples:(i + 1) * n_samples] = i

        with torch.no_grad():

            # preds = net(perturb_img.cuda()).cpu().detach().cpu()

            mbpreds = []
            fpreds = []

            re_batch_size = 50 * n_classes

            for i in range(len(xs) // re_batch_size):

                batch_data = torch.FloatTensor(xs[re_batch_size * i:re_batch_size * (i + 1)])
                batch_data = batch_data.cuda()
                preds = net(batch_data).cpu().detach().numpy()

                mbpreds = []
                for j in range(self.pre_screening_benign_ref_models_num):
                    bpreds = self.pre_screening_benign_ref_models[j](batch_data).cpu().detach().numpy()

                    mbpreds.append(bpreds)

                mbpreds = np.mean(np.array(mbpreds), axis=0)
                fpreds.append(preds - mbpreds)

            fpreds = np.concatenate(fpreds)
            preds = np.argmax(fpreds, axis=1)
            label_counts = np.bincount(preds, minlength=fpreds.shape[1])
            sorted_labels = np.argsort(label_counts)[::-1]

        return sorted_labels

    def generating_anchor(self, data_source, height, width):

        anchor_list = []
        anchor_position_list = []
        # anchor_height_width_list = [[10,5],[5,10]]

        for i in range(0, height, self.data_source_to_strides[data_source]):
            for j in range(0, width, self.data_source_to_strides[data_source]):

                # print(i,j)

                for ratio in self.anchor_height_width_list[data_source]:
                    anchor_height = ratio[0]
                    anchor_width = ratio[1]

                    if (i + anchor_height) <= height and (j +
                                                          anchor_width) <= width:
                        anchor = torch.zeros(1, height, width)
                        anchor[:, i:i + anchor_height, j:j + anchor_width] = 1
                        anchor_list.append(anchor)
                        anchor_position_list.append(
                            [i, j, i + anchor_height, j + anchor_width])

                        # print(i,j,anchor_height,anchor_width)

        anchor_list = torch.stack(anchor_list)

        return anchor_list, anchor_position_list

    def scanning(self,
                 net, model_id,
                 data_source,
                 img_data,
                 img_data_label,
                 scratch_dirpath,
                 log=True,
                 gt_mask=None,
                 gt_pattern=None):

        # noise_input = torch.rand_like(img_data).cuda()
        # img_data = noise_input

        height = img_data.size(-2)
        width = img_data.size(-1)
        channel = 1
        num_classes = self.data_source_to_num_classes[data_source]
        # stride = self.data_source_to_strides[data_source]
        pattern_size = [channel, width, height]

        steps = self.data_source_to_opt_steps[data_source]

        anchors, anchor_position_list = self.generating_anchor(data_source, height, width)

        header = [
            'Target Label', 'Large ASR', 'Large Position', 'Small ASR',
            'Small Position'
        ]

        if log:
            log_filepath = os.path.join(scratch_dirpath, 'result.csv')
            with open(log_filepath, 'w', encoding='UTF8') as f:
                writer = csv.writer(f)
                writer.writerow(header)

        sorted_labels = self.pre_screening(net)

        print('sorted_labels: {}'.format(sorted_labels))

        # for target_label_id in range(num_classes):
        for target_label_id in sorted_labels:

            best_position_small = [0, 0, 0, 0]
            best_mask_small = None
            best_pattern_small = None
            best_reg_small = float('inf')
            best_asr_small = 0

            best_position_large = [0, 0, 0, 0]
            best_mask_large = None
            best_pattern_large = None
            best_reg_large = float('inf')
            best_asr_large = 0

            if data_source == 'MNIST':
                best_position_full = [0, 0, 0, 0]
                best_mask_full = None
                best_pattern_full = None
                best_reg_full = float('inf')
                best_asr_full = 0

            high_asr_pos = []
            high_asr_value = []
            high_shift_asr_value = []
            high_asr_num = 0

            for anchor_id, (anchor, position) in enumerate(
                    zip(anchors, anchor_position_list)):

                top_left_x, top_left_y, bottom_right_x, bottom_right_y = position

                anchor_height = bottom_right_x - top_left_x
                anchor_width = bottom_right_y - top_left_y

                trigger_size = torch.sum(anchor.abs())

                # print(trigger_size)

                if trigger_size != 784:

                    # pattern_size = [channel,10, 10]
                    # pattern_size = [channel,anchor.shape[1], anchor.shape[2]]
                    pattern_size = [channel, anchor_height, anchor_width]
                else:
                    pattern_size = [channel, width, height]

                pattern_tensor = torch.zeros(pattern_size).cuda()

                pattern_tensor.requires_grad = True

                optimizer = torch.optim.Adam([pattern_tensor],
                                             lr=self.lr,
                                             betas=(0.5, 0.9))

                target_label = torch.ones_like(
                    torch.Tensor(
                        img_data.size(0)).long()).cuda() * target_label_id

                # start_time = time.time()

                for step in range(steps):

                    optimizer.zero_grad()
                    pattern_tanh_tensor = (torch.tanh(pattern_tensor) + 1) / 2
                    mask_tanh_tensor = anchor.cuda()

                    trigger_size = torch.sum(mask_tanh_tensor.abs())

                    adv_x = img_data.clone()
                    adv_x[:, :, top_left_x:top_left_x + anchor_height,
                    top_left_y:top_left_y + anchor_width] = pattern_tanh_tensor

                    output = net(adv_x)
                    pred = output.argmax(dim=1, keepdim=True)
                    asr = pred.eq(target_label.long().view_as(
                        pred)).sum().item() / (img_data.size()[0])

                    loss = self.criterion(output, target_label)

                    # print(asr, benign_acc)

                    # asr -= benign_acc

                    loss.backward()
                    optimizer.step()

                    # update small
                    # print(trigger_size)

                    if trigger_size <= 50 and asr >= best_asr_small:
                        best_asr_small = asr
                        best_reg_small = trigger_size
                        best_position_small = position
                        best_pattern_small = pattern_tanh_tensor
                        best_mask_small = mask_tanh_tensor

                    elif trigger_size <= 200 and trigger_size > 50 and asr >= best_asr_large:
                        best_asr_large = asr
                        best_reg_large = trigger_size
                        best_position_large = position
                        best_pattern_large = pattern_tanh_tensor
                        best_mask_large = mask_tanh_tensor

                # end_time = time.time() 
                # print(end_time - start_time)

                print(top_left_x, top_left_y)

                print(
                    'Model ID: {}  Target Label: {}  Anchor ID: {}/{}  ASR: {:.4f}  Best Large ASR: {:.4f}  Best Small ASR: {:.4f}'
                        .format(model_id, target_label_id, anchor_id, anchors.size(0), asr,
                                best_asr_large, best_asr_small))

                if best_asr_large > 0.85 or best_asr_small > 0.55:
                    break

            data = [
                target_label_id, best_asr_large, best_position_large,
                best_asr_small, best_position_small
            ]

            if log:

                log_filepath = os.path.join(scratch_dirpath, 'result.csv')
                with open(log_filepath, 'a', encoding='UTF8') as f:
                    writer = csv.writer(f)
                    writer.writerow(data)

                if best_asr_large > 0.85 or best_asr_small > 0.55:
                    break


if __name__ == '__main__':

    seed_torch(519)

    parser = ArgumentParser(
        description='PurdueRutgers TDC Trojan Competition Trigger Synthesis GTSRB')

    parser.add_argument('--dataset_path', type=str,
                        help='test dataset dirpath', default='/data3/share/tdc_datasets_test/')
    parser.add_argument('--benign_ref_model_dirpath', type=str,
                        help='benign reference model dirpath', default='/data3/share/tdc_datasets_v2/')
    parser.add_argument('--task', type=str,
                        help='task name', default='trigger_synthesis')
    parser.add_argument('--scratch_dirpath', type=str,
                        help='log dirpath', default='./scratch_gtsrb/')
    parser.add_argument('--phase', type=str,
                        help='phase', default='test')
    parser.add_argument('--img_dirpath', type=str,
                        help='image data dirpath', default='./data')

    args = parser.parse_args()

    dataset_path = args.dataset_path
    task = args.task
    phase = args.phase
    scratch_dirpath = args.scratch_dirpath
    img_dirpath = args.img_dirpath
    benign_ref_model_dirpath = args.benign_ref_model_dirpath

    # scratch_dirpath = './scratch_shift_anchor/'

    test_dataset = NetworkDatasetDetectionTest(os.path.join(dataset_path, task, 'test'))
    test_loader = torch.utils.data.DataLoader(test_dataset, batch_size=1, shuffle=False,
                                              num_workers=0, pin_memory=False, collate_fn=custom_collate)

    data_sources = ['CIFAR-10', 'CIFAR-100', 'GTSRB', 'MNIST']
    data_source_to_channel = {
        k: 1 if k == 'MNIST' else 3
        for k in data_sources
    }
    data_source_to_resolution = {
        k: 28 if k == 'MNIST' else 32
        for k in data_sources
    }
    data_source_to_num_classes = {
        'GTSRB': 43

    }

    data_source_to_strides = {

        'GTSRB': 3
    }

    data_source_to_anchor_list = {
        'GTSRB': [[10, 5], [5, 10], [10, 10]]
    }

    data_source_to_opt_steps = {

        'GTSRB': 15
    }

    gtsrb_img_data = torch.load(os.path.join(img_dirpath, 'gtsrb_img_data.pt'))
    gtsrb_img_label = torch.load(os.path.join(img_dirpath, 'gtsrb_img_label.pt'))

    data_source_to_img = {
        'GTSRB': gtsrb_img_data
    }

    scanner = AnchorScannear(benign_ref_model_dirpath, data_source_to_num_classes, data_source_to_strides,
                             data_source_to_anchor_list, data_source_to_opt_steps)

    for i, (net, data_source, model_id) in enumerate(test_loader):

        net = net[0]
        data_source = data_source[0]
        model_id = model_id[0]
        net.cuda().eval()

        print(model_id, data_source)
        if data_source == 'GTSRB':
            # and model_id == 'id-0274':

            run = False

            scratch_dirpath = os.path.join(
                scratch_dirpath, phase,
                model_id)

            if os.path.exists(scratch_dirpath) == False:
                os.makedirs(scratch_dirpath)
                run = True

            if run:
                img_data = data_source_to_img[data_source].cuda()

                print('===> Scanning model: {}'.format(model_id))
                scanner.scanning(net, model_id,
                                 data_source,
                                 img_data,
                                 None,
                                 scratch_dirpath,
                                 gt_mask=None,
                                 gt_pattern=None)
