const API_KEY = process.env.LASTFM_API_KEY;
const USER = "namchill235";
const URL = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USER}&api_key=${API_KEY}&format=json&limit=1`;

async function updateMusic() {
    try {
        const response = await fetch(URL);
        const data = await response.json();
        const track = data.recenttracks.track[0];

        const output = {
            name: track.name,
            artist: track.artist["#text"],
            image: track.image[3]["#text"],
            url: track.url,
            nowPlaying: track["@attr"]?.nowplaying === "true",
        };

        await Bun.write("lastfm.json", JSON.stringify(output, null, 2));
    } catch (e) {
        process.exit(1);
    }
}

updateMusic();
