# uk-gigs-to-spotify-playlists

## Overview
Create spotify playlists from events listings.

ENTS24 API is hit with today's date and a postcode. These postcodes are taken by hand as a rough approx. of each city centre. Those listings are then taken to the Spotify API search function, the first song found by the artist is then added to that months' playlist.

The end result are playlists with the pattern `{location}-{month}`.

An SQLite3 database keeps track of tracks with the schema:

## Requirements
- Spotify API credentials
- Ents24 API credentials
- Save credentials at root of project as `config.json` with structure:
``` json
{
    "ents": {
        "access_token": "", # https://developers.ents24.com/api-reference
        "client_id": "",
        "client_secret": ""
    },
    "spotify": {
        "client_id": "", # https://developer.spotify.com/documentation/web-api
        "client_secret": "",
        "refresh_token": "" # https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens
    }
}
```
- `npm i` to install packages
- Create a file called db/gigs_playlist.db
- `npm run bootstrap` to create the tables and spotify playlists

## Schemas
### `event_track` Table Schema

| Column Name                           | Data Type | Constraints                                                                 |
|---------------------------------------|-----------|-----------------------------------------------------------------------------|
| `event_track_id`                      | INTEGER   | PRIMARY KEY                                                                 |
| `uk_city_playlist_id`                 | INTEGER   | NOT NULL, FOREIGN KEY (references `uk_city_playlist(uk_city_playlist_id)`)  |
| `artist_name`                         | TEXT      | NOT NULL                                                                    |
| `date_collected`                      | TEXT      | NOT NULL                                                                    |
| `end_date`                            | TEXT      |                                                                             |
| `genre`                               | TEXT      | NOT NULL                                                                    |
| `start_date`                          | TEXT      |                                                                             |
| `track_name`                          | TEXT      | NOT NULL                                                                    |
| `track_uri`                           | TEXT      | NOT NULL                                                                    |
| `web_link`                            | TEXT      |                                                                             |
| `venue_name`                          | TEXT      | NOT NULL                                                                    |
| `unique_track_artist_in_month_playlist` |           | UNIQUE (`artist_name`, `uk_city_playlist_id`, `venue_name`)  |

#### Constraints

- unique_track_artist_in_month_playlist: Ensures that the combination of artist_name, track_uri, uk_city_playlist_id, and venue_name is unique.
- FOREIGN KEY(uk_city_playlist_id): Establishes a relationship with the uk_city_playlist table.

### `uk_city_playlist` Table Schema

| Column Name                         | Data Type | Constraints                                          |
|-------------------------------------|-----------|------------------------------------------------------|
| `uk_city_playlist_id`               | INTEGER   | PRIMARY KEY                                          |
| `month`                             | TEXT      | NOT NULL                                             |
| `name`                              | TEXT      | NOT NULL                                             |
| `playlist_id`                       | TEXT      |                                                      |
| `postcode`                          | TEXT      | NOT NULL                                             |
| `unique_name_month_postcode`        |           | UNIQUE (`month`, `name`, `postcode`)                 |

#### Constraints

- unique_name_month_postcode: Ensures that the combination of month, name, and postcode is unique.

## Implementation
I've been running this as a CRON job on a raspberry pi with the idea that it is semi-autonomous (there's a need to refresh credentials from time-to-time, but this could also be automated) with tracks being added and then removed again when out-of-date. Streaming could be an option instead of CRON here.

See it in action here:

[London- January](https://open.spotify.com/playlist/4dFqEUoM7R2wLTdGWyuBoX)

[London- February](https://open.spotify.com/playlist/4dSkh4PmnEa5cR6739BbxR)

[London- March](https://open.spotify.com/playlist/3F41IBPE7JpV7SI3FupIke)

[London- April](https://open.spotify.com/playlist/0OEpKwHRu4zswHAddZ5s0z)

[London- May](https://open.spotify.com/playlist/5lWvSqe9bQt3AB7F5iuDOo)

[London- June](https://open.spotify.com/playlist/7sxP7ieevcPtfTVNpXci3t)

[London- July](https://open.spotify.com/playlist/7AsEzoUoEyRfjNn6Ac4eYa)

[London- August](https://open.spotify.com/playlist/4p5ikaV7h3BkZe7mDkG7Sz)

[London- September](https://open.spotify.com/playlist/3gFYTaQjEknG6mmjmz73n6)

[London- October](https://open.spotify.com/playlist/3xb4VwLCAdpxQAKdyzW4XV)

[London- November](https://open.spotify.com/playlist/2rGQqWLIrOfG61xTHe1Oup)

[London- December](https://open.spotify.com/playlist/3zNUz6WiBxBYqYyPN3ZO3f)

[Cardiff- January](https://open.spotify.com/playlist/1p6MWZPdO6G0VXC9pGpEv7)

[Cardiff- February](https://open.spotify.com/playlist/2LSZoBtWvyn2qbeAGTZ0tN)

[Cardiff- March](https://open.spotify.com/playlist/1UQPtICn45baXFMLKr3x5g)

[Cardiff- April](https://open.spotify.com/playlist/4BEWESGoLUFoVN1nyTdWB7)

[Cardiff- May](https://open.spotify.com/playlist/1EfO5JeKeyiPoGkUpLZMGp)

[Cardiff- June](https://open.spotify.com/playlist/29AEPs5jFcB27y9nLBDMGX)

[Cardiff- July](https://open.spotify.com/playlist/2NSH7JK2q84pIWSyOj2x99)

[Cardiff- August](https://open.spotify.com/playlist/1irl4ozSOuYCKLD3gfHDND)

[Cardiff- September](https://open.spotify.com/playlist/4g3uwQXNBva2QQuBLGSeUB)

[Cardiff- October](https://open.spotify.com/playlist/38Xtcds2X5m3HYaBBW6H6g)

[Cardiff- November](https://open.spotify.com/playlist/0GOriAyNwhHCbQY8k1ejbQ)

[Cardiff- December](https://open.spotify.com/playlist/37kFwdoSrWn7WpMe5YzLnU)

[Leicester- January](https://open.spotify.com/playlist/0rhkT6O9kbPyE8KOrtBOyv)

[Leicester- February](https://open.spotify.com/playlist/2Aw67GsqBP6xnHC5cmQawc)

[Leicester- March](https://open.spotify.com/playlist/4c7zK2GQJWv1j662Pdkrur)

[Leicester- April](https://open.spotify.com/playlist/4VhI7ypLi3jGqVHnMq78DC)

[Leicester- May](https://open.spotify.com/playlist/5bROcYCUrr7FA2VNMp9dUI)

[Leicester- June](https://open.spotify.com/playlist/5mviz5isuYgPqo6Lit0DCb)

[Leicester- July](https://open.spotify.com/playlist/4PftS14Kf27ziNs7fIGBNK)

[Leicester- August](https://open.spotify.com/playlist/48KWuNsWWsaTZsgNdOSd97)

[Leicester- September](https://open.spotify.com/playlist/16E2nbi3pSqRzTuq22EiPx)

[Leicester- October](https://open.spotify.com/playlist/7D3M8pjRO2zxBhOfuhXsy8)

[Leicester- November](https://open.spotify.com/playlist/4E8OJZOsPma2Kc6QQxR2Pk)

[Leicester- December](https://open.spotify.com/playlist/3Su4z9drNmNOuZNVVK1qYO)

[Liverpool- January](https://open.spotify.com/playlist/1dmkKL6isKvRMROGGFSO7t)

[Liverpool- February](https://open.spotify.com/playlist/1B3vieh94cpBSxjTPXIlZM)

[Liverpool- March](https://open.spotify.com/playlist/1jGOJwjTRN8cFsXhxkSdB0)

[Liverpool- April](https://open.spotify.com/playlist/4z2KZTu5vQ1SCAbMWhRNwU)

[Liverpool- May](https://open.spotify.com/playlist/4LxM5aAc33d36tTLpc5qh7)

[Liverpool- June](https://open.spotify.com/playlist/2POTW7oGnhrUuYYXJznEub)

[Liverpool- July](https://open.spotify.com/playlist/4u8EJVjHi3fN9GIS6GPP0z)

[Liverpool- August](https://open.spotify.com/playlist/2kvisvI1vdBmgetitPSRSb)

[Liverpool- September](https://open.spotify.com/playlist/1aLusKq9Jb2kprcjFd7IH4)

[Liverpool- October](https://open.spotify.com/playlist/1Cq3w1fU89w6bXvxuwOSUf)

[Liverpool- November](https://open.spotify.com/playlist/1oUH7C0AQTloPwrSUWSf4g)

[Liverpool- December](https://open.spotify.com/playlist/6k7KFe1wESdJqvga7dRMwy)

[Manchester- January](https://open.spotify.com/playlist/1flwN6a8y4pMXHEFmQW5dh)

[Manchester- February](https://open.spotify.com/playlist/630TkWpjRcEkEqqQ8jiEvE)

[Manchester- March](https://open.spotify.com/playlist/1Bnn2ONQHVM1S8yUoQ04ux)

[Manchester- April](https://open.spotify.com/playlist/0UPJ5EPdOsBtIk8Ynt2qz9)

[Manchester- May](https://open.spotify.com/playlist/2KkZFB3Borf5zay2C3CHuu)

[Manchester- June](https://open.spotify.com/playlist/6QmgqlkeosvehlVPShhP6o)

[Manchester- July](https://open.spotify.com/playlist/3U8iXXVuCoOnyrT7zDZtfO)

[Manchester- August](https://open.spotify.com/playlist/5zmHdL0XenDcaMeQyfRian)

[Manchester- September](https://open.spotify.com/playlist/7oCk8GDRRy5gY4LEJMHfVA)

[Manchester- October](https://open.spotify.com/playlist/3fJVnj9i45NHW18YpM5kJL)

[Manchester- November](https://open.spotify.com/playlist/2RNtHrA59XtTmbL29pR38M)

[Manchester- December](https://open.spotify.com/playlist/6wfYigF8Bg18mrwytYVcTx)

[Inverness- January](https://open.spotify.com/playlist/7Gk0Q6l34sZxBtpgtwHv4y)

[Inverness- February](https://open.spotify.com/playlist/5qXrtu4unfoPDPWVjkNnJO)

[Inverness- March](https://open.spotify.com/playlist/7uoLAsBEUbukEtLRVlLqex)

[Inverness- April](https://open.spotify.com/playlist/17NaXemOIgQ0BZ7hQLBlZg)

[Inverness- May](https://open.spotify.com/playlist/752rjXFdD0V8MgqsEmkYEm)

[Inverness- June](https://open.spotify.com/playlist/2l6sfgDPCIpmRmVNcAiBvE)

[Inverness- July](https://open.spotify.com/playlist/2FfvUh4iyu7MTdn8COyULT)

[Inverness- August](https://open.spotify.com/playlist/4VzDBZaF9nHULUqT47sAcZ)

[Inverness- September](https://open.spotify.com/playlist/232z59aIdVTQP4ZJpRw1R6)

[Inverness- October](https://open.spotify.com/playlist/1wFKLEky7Mwr5IMulq8sMF)

[Inverness- November](https://open.spotify.com/playlist/6sZJhJgEfrswodpqtsEOwY)

[Inverness- December](https://open.spotify.com/playlist/11Zn0qKNRP0LRtegvxQ5XB)

[Newcastle upon Tyne- January](https://open.spotify.com/playlist/5pAfYXC5ILh0V1FpWFMYjI)

[Newcastle upon Tyne- February](https://open.spotify.com/playlist/2fy2njasGrESMgXcVpYwYP)

[Newcastle upon Tyne- March](https://open.spotify.com/playlist/19olMDRIPL9a4mjMwWBuH4)

[Newcastle upon Tyne- April](https://open.spotify.com/playlist/12KKZham8a0Ook9YJlxnjc)

[Newcastle upon Tyne- May](https://open.spotify.com/playlist/2ucsZVZGc9KPZDToZL7Gjh)

[Newcastle upon Tyne- June](https://open.spotify.com/playlist/5FqMExQ0HFtKfCuZAct0A6)

[Newcastle upon Tyne- July](https://open.spotify.com/playlist/5lwL5Q9PlRA3iXjhHjpHoC)

[Newcastle upon Tyne- August](https://open.spotify.com/playlist/6NoN69dgdDr4aiJwo81oPz)

[Newcastle upon Tyne- September](https://open.spotify.com/playlist/0wJzQtWGBb8UT6TTSn0BWq)

[Newcastle upon Tyne- October](https://open.spotify.com/playlist/38Lk6q73YJMDZYPoQfPbMW)

[Newcastle upon Tyne- November](https://open.spotify.com/playlist/6ORzHpJz6mN3y9KT26GlMi)

[Newcastle upon Tyne- December](https://open.spotify.com/playlist/7M7vuRbGUsIgVqnv4FduDv)

[Belfast- January](https://open.spotify.com/playlist/5DdM5t2wARx22DYsk7Wb7Q)

[Belfast- February](https://open.spotify.com/playlist/6UE8r3NhWIonkCGwYuu5RX)

[Belfast- March](https://open.spotify.com/playlist/3IdHZZlQx2EvgUauJ9u09I)

[Belfast- April](https://open.spotify.com/playlist/6YNYfFuAlmiJ4em62sgylQ)

[Belfast- May](https://open.spotify.com/playlist/1rk5xjPFrCmtIjNQhG4jQ9)

[Belfast- June](https://open.spotify.com/playlist/13mmnJpejaST8iYRS5s0BV)

[Belfast- July](https://open.spotify.com/playlist/333Vv1nvigRuI6MsrUo6vW)

[Belfast- August](https://open.spotify.com/playlist/6JiCbnWfl2mk9NQgNtQPlo)

[Belfast- September](https://open.spotify.com/playlist/7zFzRw1INyjruYV4BQOIr9)

[Belfast- October](https://open.spotify.com/playlist/53Cv2G19VUicOgNoBhxKSU)

[Belfast- November](https://open.spotify.com/playlist/0dxCQb3csTYyiHLcztvYG6)

[Belfast- December](https://open.spotify.com/playlist/4fj7zqovdFwBoMcYMOlBL7)

[Plymouth- January](https://open.spotify.com/playlist/46w5sv2CES09lO5N7tjD4b)

[Plymouth- February](https://open.spotify.com/playlist/12AoCVrj7j91lYh7USsZNM)

[Plymouth- March](https://open.spotify.com/playlist/2jvC6MgMPOd339y0ZoulHx)

[Plymouth- April](https://open.spotify.com/playlist/6x2KNOXNc8AiFra4peJif0)

[Plymouth- May](https://open.spotify.com/playlist/4eUGHOf0Faoq2nNxas9GvB)

[Plymouth- June](https://open.spotify.com/playlist/7KnAFiBUS6Ranzeo11CRtN)

[Plymouth- July](https://open.spotify.com/playlist/0DwLT9bdqNfCeqxwjbKlbJ)

[Plymouth- August](https://open.spotify.com/playlist/7zO8ZkmNPONTRrCCGQyHEc)

[Plymouth- September](https://open.spotify.com/playlist/6HsbO38xQrp9Ym5YSjqGri)

[Plymouth- October](https://open.spotify.com/playlist/5R9mYiOhuSPAD7ddZAhHjD)

[Plymouth- November](https://open.spotify.com/playlist/5rodQDcoqEeb5qhelazcAW)

[Plymouth- December](https://open.spotify.com/playlist/0ExPBL0vima8i0HRD21Nob)

[Edinburgh- January](https://open.spotify.com/playlist/0ZbtONUbpen1QgaEcARRLn)

[Edinburgh- February](https://open.spotify.com/playlist/4KixzTarkSEYCaJcgrySUI)

[Edinburgh- March](https://open.spotify.com/playlist/1X7gOWAdnyYA07wyK5kJT6)

[Edinburgh- April](https://open.spotify.com/playlist/1ubdNyCDmY4LdPiHM9wOxJ)

[Edinburgh- May](https://open.spotify.com/playlist/4iAeUJtYFuZuxdaSnxQ89p)

[Edinburgh- June](https://open.spotify.com/playlist/0RsUgaoZYDZlk4oltD0Lmf)

[Edinburgh- July](https://open.spotify.com/playlist/1QcV700cEGuyyl8Xm8SXYZ)

[Edinburgh- August](https://open.spotify.com/playlist/4xSFp9YtDhSBJrrZIesaXW)

[Edinburgh- September](https://open.spotify.com/playlist/2NPPijISB67zIVHbkefEbk)

[Edinburgh- October](https://open.spotify.com/playlist/5XI4lpBhEZR9xWLBcygefs)

[Edinburgh- November](https://open.spotify.com/playlist/2HMIvmVi4UH5UJei3ygFxU)

[Edinburgh- December](https://open.spotify.com/playlist/5Q4DQjAQeBgcOrvQnA8Fl3)

[Milton Keynes- January](https://open.spotify.com/playlist/1NNh9VEtaToHBGIprVNixa)

[Milton Keynes- February](https://open.spotify.com/playlist/4SLmJD1aXycEg3eFtKbvpA)

[Milton Keynes- March](https://open.spotify.com/playlist/4vEcWLYv8v5WK0vLG13xKz)

[Milton Keynes- April](https://open.spotify.com/playlist/5xnNpruc375RW0BU7ZLXEK)

[Milton Keynes- May](https://open.spotify.com/playlist/0Mmo5XKCiApMSME84iRvCG)

[Milton Keynes- June](https://open.spotify.com/playlist/3Lx8THOcoPy5zJmk0499qS)

[Milton Keynes- July](https://open.spotify.com/playlist/0FZa0PuyKMUtR5SmSd8k1T)

[Milton Keynes- August](https://open.spotify.com/playlist/7rq9GhGpaaYnlz9vwGJmHC)

[Milton Keynes- September](https://open.spotify.com/playlist/7mF9PcuSTdg04uNNCygtpd)

[Milton Keynes- October](https://open.spotify.com/playlist/0y83xSstRQ7vZJjWSFqY7k)

[Milton Keynes- November](https://open.spotify.com/playlist/3Ae73MT2x1sQux0mXrWcg8)

[Milton Keynes- December](https://open.spotify.com/playlist/3QEQdXATYI5P9BbdbCobNQ)

[Brighton- January](https://open.spotify.com/playlist/2lXFa2H1ZokVG8FBkfHXZi)

[Brighton- February](https://open.spotify.com/playlist/3b3BJIFeycGciC6BaT39GI)

[Brighton- March](https://open.spotify.com/playlist/3hbAqenOIpznyE1Kz4depk)

[Brighton- April](https://open.spotify.com/playlist/1ezExVVINLDyOp7vopjKx6)

[Brighton- May](https://open.spotify.com/playlist/0LIldX6tb3egdAvZinhSkp)

[Brighton- June](https://open.spotify.com/playlist/12E6QFYpkkZByMf9XukTQ7)

[Brighton- July](https://open.spotify.com/playlist/03Mv6J2uIDM01EDAT5rZ28)

[Brighton- August](https://open.spotify.com/playlist/0tkzuedp3kN0UR4L5ODIAw)

[Brighton- September](https://open.spotify.com/playlist/2LMPHDkqMcsHAp2FxVQafA)

[Brighton- October](https://open.spotify.com/playlist/1coQb5KzuX5wEkw28b1JyA)

[Brighton- November](https://open.spotify.com/playlist/3IDPl1zkOWEQQcmtXcwajO)

[Brighton- December](https://open.spotify.com/playlist/60H6L7ENKg47funR0d1mYG)

[Leeds- January](https://open.spotify.com/playlist/6GnrxsexJAPHlb4qU8Hh4v)

[Leeds- February](https://open.spotify.com/playlist/6J7Nyf5rhPX1B5JbhG5Pmz)

[Leeds- March](https://open.spotify.com/playlist/0pAn8JwnY77GewUhdrAxgs)

[Leeds- April](https://open.spotify.com/playlist/4d1al9y6O9OAZOiVoNfFVV)

[Leeds- May](https://open.spotify.com/playlist/7qDp3sdjIPtRngtbiVi8wE)

[Leeds- June](https://open.spotify.com/playlist/2plgoTWwnse9Bg8VSbEAZm)

[Leeds- July](https://open.spotify.com/playlist/21NRKyhZRmRZFtk9jiZS3L)

[Leeds- August](https://open.spotify.com/playlist/398YVw5Mhz1Q1rPNb4Kht8)

[Leeds- September](https://open.spotify.com/playlist/6xU9Oxvs5WjP0Ag0JxZ3Q5)

[Leeds- October](https://open.spotify.com/playlist/6JjGfmnaoqcBVbQRMRE39v)

[Leeds- November](https://open.spotify.com/playlist/48jbTwvBHys5UthlS1PmPH)

[Leeds- December](https://open.spotify.com/playlist/6dhBKMLRZSwfHuJkBHPuWJ)

[Sheffield- January](https://open.spotify.com/playlist/30JsIH1wufMEW7F1YlrjsS)

[Sheffield- February](https://open.spotify.com/playlist/4LW3BDgW20MXtHHAapZQCt)

[Sheffield- March](https://open.spotify.com/playlist/6okO28l7n01P4JzXNKyann)

[Sheffield- April](https://open.spotify.com/playlist/22zj3HGF9Ef5QTo3xZX11O)

[Sheffield- May](https://open.spotify.com/playlist/0HEfx1nwXgZ48tCbU3HdQK)

[Sheffield- June](https://open.spotify.com/playlist/03QAzPGdJs3K8UOR9ozpQR)

[Sheffield- July](https://open.spotify.com/playlist/7pCU8ujEp944f8kBmYnGBM)

[Sheffield- August](https://open.spotify.com/playlist/3xDjcPwW4DYaoqwYn2aNt7)

[Sheffield- September](https://open.spotify.com/playlist/0mFUQTkiS7wZ2XW2t3e6PM)

[Sheffield- October](https://open.spotify.com/playlist/0E40d0svl9kVw0GHdkjgsu)

[Sheffield- November](https://open.spotify.com/playlist/2vcbWYil9YPEVhEaMboih2)

[Sheffield- December](https://open.spotify.com/playlist/7kQYqGIxeFKSeJiqImHTkW)

[Birmingham- January](https://open.spotify.com/playlist/26ChAPyLUx8ef4rUosYfLS)

[Birmingham- February](https://open.spotify.com/playlist/1zBku5I4MIpeh5WuGgIGN8)

[Birmingham- March](https://open.spotify.com/playlist/0HIZjbLOp2SqEZMifP0wpL)

[Birmingham- April](https://open.spotify.com/playlist/67OKCvpR0mf2kACfyl8gQg)

[Birmingham- May](https://open.spotify.com/playlist/4g5NXQXjl5PBJH8P3TXgZ5)

[Birmingham- June](https://open.spotify.com/playlist/2WBm9Oz5L5bnVzVM841KP0)

[Birmingham- July](https://open.spotify.com/playlist/6w4mdpwzJTfuaD60ysIGCj)

[Birmingham- August](https://open.spotify.com/playlist/2BD4AaggZTnGMxNRwPLU5c)

[Birmingham- September](https://open.spotify.com/playlist/2skYhX7mJ9U9iyV99p52Tg)

[Birmingham- October](https://open.spotify.com/playlist/542Qna4xzQAnyrbGiXqJNZ)

[Birmingham- November](https://open.spotify.com/playlist/6bS0T9hgE5VMz11QQGzL7e)

[Birmingham- December](https://open.spotify.com/playlist/0rFuHs0CZdUEwnNjDXIr78)

[Bristol- January](https://open.spotify.com/playlist/7BiYuTRtO1gGI6ETgTtmE3)

[Bristol- February](https://open.spotify.com/playlist/2dMVpuGz2PKfJQBRP7htuf)

[Bristol- March](https://open.spotify.com/playlist/0a5sVu4Dq9lMFcusVJ9xvp)

[Bristol- April](https://open.spotify.com/playlist/3sgXZZxPAAO5L1JiS2ZrbI)

[Bristol- May](https://open.spotify.com/playlist/0ixiLeoFJ0HWKkH4AbDEZn)

[Bristol- June](https://open.spotify.com/playlist/27JgkXWk0gDiILmU2Ya8nA)

[Bristol- July](https://open.spotify.com/playlist/5A9n5mlky1bPszpAUjawMj)

[Bristol- August](https://open.spotify.com/playlist/0CdkEeBN9jGSJPkrtVoNjk)

[Bristol- September](https://open.spotify.com/playlist/0zRBN2CzzDDd70ltYq3hkM)

[Bristol- October](https://open.spotify.com/playlist/2ianOqsAJvv6gyP5BlCsCo)

[Bristol- November](https://open.spotify.com/playlist/2dQ6GS0pXk63luBzOl1qQu)

[Bristol- December](https://open.spotify.com/playlist/0tMtmPEryqTfoCibKcbtjG)

[Glasgow- January](https://open.spotify.com/playlist/3bQXnndhnpj2I3XKHjHTGE)

[Glasgow- February](https://open.spotify.com/playlist/7xNuLoG8iPqaBoSSa6q365)

[Glasgow- March](https://open.spotify.com/playlist/6XmNdDE6i00tRPrGEIqI4a)

[Glasgow- April](https://open.spotify.com/playlist/3z8gQ2vItbxjlFs6AUtCIt)

[Glasgow- May](https://open.spotify.com/playlist/7cgqwedH5eU0NsFGK6JIeM)

[Glasgow- June](https://open.spotify.com/playlist/5njnVJM7mBUpg4yvcPjYSl)

[Glasgow- July](https://open.spotify.com/playlist/2rbDy6YB63CJEldTK29zPP)

[Glasgow- August](https://open.spotify.com/playlist/4VdWEgMvlJppRqFtHNPmGq)

[Glasgow- September](https://open.spotify.com/playlist/6ostuHCbIlUi8EKlihOYEu)

[Glasgow- October](https://open.spotify.com/playlist/1PWSxTXJVP6eg0iEd53cg7)

[Glasgow- November](https://open.spotify.com/playlist/20X9SKYAVBsPMEI1duIUUz)

[Glasgow- December](https://open.spotify.com/playlist/7fk4sIqpzKQMSCQDBisF5s)

