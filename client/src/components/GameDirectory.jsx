import React from 'react';
import { Link } from "react-router-dom";
import '../App.scss';

const buildFallbackCover = (gameName) => {
    if (!gameName) {
        return null;
    }
    return `https://static-cdn.jtvnw.net/ttv-boxart/${encodeURIComponent(gameName)}-285x380.jpg`;
};

function GameDirectory({ gamesOnLive = [] }) {
    return (
        <>
            <div className="games-carousel">

                {gamesOnLive.map((game) => {
                    const coverUrl = game?.gameBoxArtUrl ?? buildFallbackCover(game?.game_name);
                    const viewers = Number.isFinite(game?.game_views) ? game.game_views : 0;
                    return (
                        <Link key={game?.game_id ?? game?.id ?? game?.game_name} to={`/d/g/${encodeURIComponent(game.game_name)}`}>
                            <div className="game">
                                <div className="game-cover">
                                    <img src={coverUrl} alt={game.game_name} loading="lazy" />
                                </div>
                                <div className="game-info">
                                    <p className="game-title">{game.game_name}</p>
                                    <p className="game-viewership">{viewers.toLocaleString('fr-FR')} Vues</p>
                                </div>
                            </div>
                        </Link>
                    );
                })}

                
            </div>
        </>
    );
}

export default GameDirectory;
