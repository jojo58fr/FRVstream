import { useState, useEffect } from 'react'
import styles from './NoStreamComponent.module.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGhost, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

import API from '../Api.js';

function NoStreamComponent() {

    const [isOnline, setIsOnline] = useState(false);

    const getApiOnline = async () => {
        setIsOnline(await API.isOnline);
    }

    useEffect(() => {

        getApiOnline();
  
    }, [])

    API.onUpdate = function () {    
        getApiOnline();
    }

    return (
        <div className={styles['noStreamComponent']}>

            {!isOnline && <>
                <FontAwesomeIcon size='6x' icon={faTriangleExclamation} className={styles['noApiStreamLogo']}/>
                <span>API Serveur offline.</span>
            </>}

            {isOnline && <>
                <FontAwesomeIcon size='6x' icon={faGhost} className={styles['noApiStreamLogo']}/>
                <span>Pas de stream disponible.</span>
            </>}
        </div>
    )
}

export default NoStreamComponent
