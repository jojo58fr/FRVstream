import React, { useContext } from 'react';
import { Outlet, Link } from "react-router-dom";
import '../App.scss';

function GameDirectory(props) {

    return (
    <>
        <div class="games-carousel">

            {props.gamesOnLive.map((game) => { return(<>
                <Link to={`/d/g/${encodeURIComponent(game.game_name)}`}>
                    <div class="game">
                        <div class="game-cover">
                            <img src={`https://static-cdn.jtvnw.net/ttv-boxart/${game.game_name}-285x380.jpg`} alt={game.game_name} />
                        </div>
                        <div class="game-info">
                            <p class="game-title">{game.game_name}</p>
                            <p class="game-viewership">{game.game_views} Vues</p>
                        </div>
                        {/* <div class="game-categories">
                            <span>Simulation</span>
                        </div> */}
                    </div>
                </Link>
            </>)})}

            
        </div>
    </>
    )
}

export default GameDirectory
