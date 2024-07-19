const path = require('path')
const tools = require("../tools");

const database_file = path.parse(__dirname).dir + '/db/gig_playlists.db'

const db = tools.getSqlLiteDB(database_file);

db.exec(`drop table if exists event_track`)

db.exec(`
    create table if not exists event_track (
        event_track_id integer primary key,
        uk_city_playlist_id integer not null,
        artist_name text not null,
        date_collected text not null,
        end_date text,
        genre text not null,
        start_date text,
        track_name text not null,
        track_uri text not null,
        web_link text,
        venue_name text not null,
        constraint unique_artist_in_month_playlist unique (artist_name, uk_city_playlist_id, venue_name)
        foreign key(uk_city_playlist_id) references uk_city_playlist(uk_city_playlist_id)
        )
`)
