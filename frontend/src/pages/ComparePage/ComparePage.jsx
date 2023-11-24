// src/pages/ComparePage/ComparePage.jsx

import React, { useState, useEffect }  from 'react';
import { fetchTestApi} from "../../services/testServices";

function ComparePage() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchTestApi()
            .then(data => setData(data))
            .catch(error => console.error('Error in component: ', error));
    }, []);

    return (
        <div>
            <h1>
                <p> {data || "Loading..."} </p>
            </h1>
        </div>
    );
}

export default ComparePage;
