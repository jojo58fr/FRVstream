import { useState, useEffect, useContext } from 'react'
import API from './Api.js';
import { LoginContext } from './App.jsx';

import { useNavigate } from 'react-router-dom';

import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Accordion, AccordionTab } from 'primereact/accordion';

import './LoginBG.scss';
import styles from './Login.module.scss';

import UniversalLoginSystem from './UniversalLoginSystem/index.js';

function Login() {

    const navigate = useNavigate();

    const [isLogged, setIsLogged] = useContext(LoginContext);

    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        document.querySelector('.stream-content').classList.add("bg-horizon");

        //Clean-Up / Unmount
        return () => {
            document.querySelector('.stream-content').classList.remove("bg-horizon");
        };
    }, []);

    if(isLogged)
    {
        console.log("Already logged, redirecting...");
        //alert("already logged");
        navigate('/');
    }

    const runLogin = async () => {


        if(username.length > 0 && password.length > 0)
        {
            //alert();
            //navigate('/');

            let login = await UniversalLoginSystem.request_login(username, password);
            console.log("login:", login);

            if(login)
            {
                let iL = await UniversalLoginSystem.request_status();
                //console.log("iL:", iL);
                setIsLogged(iL);

                if(iL)
                {
                    navigate('/');
                }
            }
        }
    }

    return (
    <>
        
        <div className={`${styles['wrapper-form']}`}>
            <h2>Bienvenue/Rebienvenue dans le rabbit-hole du Vtubing !</h2>
            <h3>Connectes-toi via Discord ou Twitch (Bientôt ! 👀)</h3>

            {/* <div className={`${styles['w-btns-login']}`}>
                <Button icon="pi pi-discord" style={{color: "white"}} label="Connexion avec Discord" rounded/>
                <Button icon="pi pi-twitch" style={{color: "white"}} label="Connexion avec Twitch" rounded/>
            </div> */}

            <Accordion>
                <AccordionTab header="Autre connexion">
                    <div>
                        <label htmlFor="username"  className="block text-900 text-xl font-medium mb-2">
                            Pseudo
                        </label>
                        <InputText inputid="username" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mb-5" style={{ padding: '1rem' }} />

                        <label htmlFor="password" className="block text-900 font-medium text-xl mb-2">
                            Mot de passe
                        </label>
                        <Password inputid="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" toggleMask className="w-full mb-5" inputClassName="w-full p-3" pt={{ iconField: { root: { className: 'w-full' } } }}></Password>

                        <Button label="Sign In" style={{color: "white"}} icon="pi pi-sign-in" className="w-full p-3 text-xl mb-2" onClick={() => runLogin()} severity="info"></Button>
                    </div>
                </AccordionTab>
            </Accordion>

            <div className="w-credit-photo-bg">
                <span className='credit-photo-bg'>Crédit photo 	&copy; <a href="https://x.com/Horizon_vtFR" target="_blank">Horizon Officiel</a></span>
            </div>

        </div>
    </>
    )
}

export default Login
