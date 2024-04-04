import './App.scss'

function Leftbar() {

  return (
    <>
        <div className="streamer-bar">

            <div className="streamer-bar-title">
                <p className="desktop-title">Chaines Suivis ❤</p>
                <p className="mobile-title">❤</p>
            </div>

            <div className="followed-channels">
                <div className="followed-channel">
                <div className="profile-image">
                    <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/a28eeb53-d80d-4bd2-8d85-d2f65fa8ba1e-profile_image-70x70.png" alt="A_Seagull" />
                </div>
                <div className="profile-info">
                    <p className="profile-username">TakuDev</p>
                    <p className="profile-game-title">Mario Kart 8 Deluxe</p>
                </div>
                <div className="profile-viewers">
                    <div className="live-icon"></div>
                    <div className="viewer-count">32</div>
                </div>
                </div>
                <div className="followed-channel">
                <div className="profile-image">
                    <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/89ccba82-3058-42cd-ac9e-acd1c4b88cdf-profile_image-70x70.png" alt="Fitzyhere" />
                </div>
                <div className="profile-info">
                    <p className="profile-username">Lunahyu</p>
                    <p className="profile-game-title">KinitoPET</p>
                </div>
                <div className="profile-viewers">
                    <div className="live-icon"></div>
                    <div className="viewer-count">28</div>
                </div>
                </div>
                <div className="followed-channel">
                <div className="profile-image">
                    <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/258204a8-ab11-4488-9566-a0ce3e7a95ec-profile_image-70x70.png" alt="FRAN" />
                </div>
                <div className="profile-info">
                    <p className="profile-username">MissFlamme</p>
                    <p className="profile-game-title">Chaine offline</p>
                </div>
                </div>
                <div className="followed-channel">
                <div className="profile-image">
                    <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/28b2f409-63f8-4816-8231-d01f338a4d2f-profile_image-70x70.png" alt="MMB" />
                </div>
                <div className="profile-info">
                    <p className="profile-username">MyMikuBot</p>
                    <p className="profile-game-title">1 Nouvelle vidéo</p>
                </div>
                <div className="profile-viewers">
                    {/* <!-- <div className="viewer-count">Online</div> --> */}
                </div>
                </div>
            </div>
        {/* <br />
        <small>Voir plus...</small> 
        <br />*/}

            <div className="streamer-bar-title">
                <p className="desktop-title">Chaines FRVtubers</p>
                <p className="mobile-title">🇫🇷</p>
            </div>
            <div className="followed-channels">
                <div className="followed-channel " onClick={ () => {setActualChannel("TakuDev")} }>
                <div className="profile-image">
                    <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/a28eeb53-d80d-4bd2-8d85-d2f65fa8ba1e-profile_image-70x70.png" alt="A_Seagull" />
                </div>
                <div className="profile-info">
                    <p className="profile-username">TakuDev</p>
                    <p className="profile-game-title">Mario Kart 8 Deluxe</p>
                </div>
                <div className="profile-viewers">
                    <div className="live-icon"></div>
                    <div className="viewer-count">32</div>
                </div>
                </div>
                <div className="followed-channel" onClick={ () => {setActualChannel("Nyastra")} }>
                <div className="profile-image">
                    <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/89ccba82-3058-42cd-ac9e-acd1c4b88cdf-profile_image-70x70.png" alt="Fitzyhere" />
                </div>
                <div className="profile-info">
                    <p className="profile-username">Lunahyu</p>
                    <p className="profile-game-title">KinitoPET</p>
                </div>
                <div className="profile-viewers">
                    <div className="live-icon"></div>
                    <div className="viewer-count">28</div>
                </div>
                </div>
                <div className="followed-channel">
                <div className="profile-image">
                    <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/258204a8-ab11-4488-9566-a0ce3e7a95ec-profile_image-70x70.png" alt="FRAN" />
                </div>
                <div className="profile-info">
                    <p className="profile-username">MissFlamme</p>
                    <p className="profile-game-title">Chaine offline</p>
                </div>
                </div>
                <div className="followed-channel">
                <div className="profile-image">
                    <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/28b2f409-63f8-4816-8231-d01f338a4d2f-profile_image-70x70.png" alt="MMB" />
                </div>
                <div className="profile-info">
                    <p className="profile-username">MyMikuBot</p>
                    <p className="profile-game-title">1 Nouvelle vidéo</p>
                </div>
                <div className="profile-viewers">
                    {/* <!-- <div className="viewer-count">Online</div> --> */}
                </div>
                </div>
            </div>
            <br />
            <small>Voir plus...</small>
            <br />

            <div className="streamer-bar-title">
                <p className="desktop-title">Chaines VtuberQC</p>
                <p className="mobile-title">⚜️</p>
            </div>
            <div className="followed-channels">
                <div className="followed-channel">
                <div className="profile-image">
                    <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/a_seagull-profile_image-4d2d235688c7dc66-70x70.png" alt="A_Seagull" />
                </div>
                <div className="profile-info">
                    <p className="profile-username">LuluneTV</p>
                    <p className="profile-game-title">FINAL FANTASY VII REBIRTH</p>
                </div>
                <div className="profile-viewers">
                    <div className="live-icon"></div>
                    <div className="viewer-count">200</div>
                </div>
                </div>
                <div className="followed-channel">
                <div className="profile-image">
                    <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/23e736e2-b157-432b-9143-0781401b056f-profile_image-70x70.png" alt="Fitzyhere" />
                </div>
                <div className="profile-info">
                    <p className="profile-username">Zabymarou</p>
                    <p className="profile-game-title">Valorant</p>
                </div>
                <div className="profile-viewers">
                    <div className="live-icon"></div>
                    <div className="viewer-count">20</div>
                </div>
                </div>
            </div>


            {/* <div className="recommended-channels">
                <div className="streamer-bar-title">
                <p className="desktop-title">Recommended Channels</p>
                <p className="mobile-title"><i className="fa fa-film"></i></p>
                </div>
                <div className="followed-channels">
                <div className="followed-channel">
                    <div className="profile-image">
                    <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/a5e9679a-6b4d-436c-9e78-d801e42555fc-profile_image-70x70.png" alt="Princess" />
                    </div>
                    <div className="profile-info">
                    <p className="profile-username">PrinzessinDaenerys</p>
                    <p className="profile-game-title">Overwatch</p>
                    </div>
                    <div className="profile-viewers">
                    <div className="live-icon"></div>
                    <div className="viewer-count">1.1K</div>
                    </div>
                </div>
                <div className="followed-channel">
                    <div className="profile-image">
                    <img src="https://yt3.ggpht.com/a/AATXAJw5CettE2cTDy_IDP37036lK9ShIfbDOAytUw=s288-c-k-c0xffffffff-no-rj-mo" alt="Sylvi" />
                    </div>
                    <div className="profile-info">
                    <p className="profile-username">Sylvibot</p>
                    <p className="profile-game-title">Overwatch</p>
                    </div>
                    <div className="profile-viewers">
                    <div className="live-icon"></div>
                    <div className="viewer-count">165</div>
                    </div>
                </div>
                <div className="followed-channel">
                    <div className="profile-image">
                    <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/lara6683-profile_image-4aa7e08e70c72924-70x70.jpeg" alt="Lara" />
                    </div>
                    <div className="profile-info">
                    <p className="profile-username">lara6683</p>
                    <p className="profile-game-title">
                        3 new videos
                    </p>
                    </div>
                    <div className="profile-viewers">
                    <div className="viewer-count"></div>
                    </div>
                </div>
                </div>
            </div>
            <br />
            <small>Show More</small>
            <br /> */}
        </div>
    </>
  )
}

export default Leftbar
