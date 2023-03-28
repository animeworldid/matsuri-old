import { request } from "https";
import moment from "moment";

type AnilistAnimeTitle =
        "english" | "native" | "romaji" | "userPreferred";
export interface AnilistAnime {
    "id": number;
    "idMal": number | null;
    "startDate": {
        "year": number | null;
        "month": number | null;
        "day": number | null;
    } | null;
    "endDate": {
        "year": number | null;
        "month": number | null;
        "day": number | null;
    } | null;
    "season": string | null;
    "seasonYear": number | null;
    "averageScore": number | null;
    "status": string | null;
    "genres": string[] | null;
    "description": string | null;
    "episodes": number | null;
    "coverImage": Record<string, string>;
    "title": Record<AnilistAnimeTitle, string>;
}

export interface AnilistAnimePage {
    pageInfo: {
        "lastPage": number;
        "hasNextPage": boolean;
    };
    media: AnilistAnime[];
}

export class Anilist {
    public constructor(private readonly token?: string) {
        this.token = token;
    }

    public query(query: string, variables: object): Promise<AnilistAnimePage | null> {
        const headers: Record<string, string> = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "Content-Type": "application/json; charset=utf-8",
            Accept: "application/json"
        };
        const options: Record<string, any> = {
            hostname: "graphql.anilist.co",
            port: 443,
            path: "/",
            method: "POST",
            headers
        };
        return new Promise((resolve, reject) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (this.token) options.headers["Authorization"] = `Bearer ${this.token}`;
            const req = request(options, res => {
                let raw = "";
                res.on("data", chunk => raw += chunk);
                res.on("end", () => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    if (res.statusCode! >= 200 && res.statusCode! < 300) return resolve(JSON.parse(raw).data.Page as AnilistAnimePage);
                    return reject(
                        new Error("[Anilist] Error while trying to send data to https://graphql.anilist.co," +
                            `${res.statusCode!.toString()} ${res.statusMessage!.toString()}`)
                    );
                });
            }).on("error", reject);
            req.write(JSON.stringify({ query, variables: JSON.stringify(variables) }));
            req.end();
        });
    }

    public async findAnimeByTitle(title: string): Promise<AnilistAnimePage | null> {
        return this.query(
            `query($title:String) {
  Page(perPage:10) {
    pageInfo {
      lastPage
      hasNextPage
    }
    media(search: $title, isAdult: false) {
        id
        idMal
        startDate {
            year
            month
            day
        }
        endDate {
            year
            month
            day
        }
        season
        seasonYear
        averageScore
        status
        genres
        description(asHtml:true)
        episodes
        coverImage {
            large
        }
        title {
            romaji
            english
            native
            userPreferred
        }
    }
  }
}`, { title }
        );
    }

    public async getAnimeById(id: number): Promise<AnilistAnime | null> {
        const query = await this.query(
            `query($animeId:Int) {
  Page(perPage:1) {
    pageInfo {
      lastPage
      hasNextPage
    }
    media(id: $animeId, isAdult: false) {
        id
        idMal
        startDate {
            year
            month
            day
        }
        endDate {
            year
            month
            day
        }
        season
        seasonYear
        averageScore
        status
        genres
        description(asHtml:true)
        episodes
        coverImage {
            large
        }
        title {
            romaji
            english
            native
            userPreferred
        }
    }
  }
}`, { animeId: id }
        );
        return new Promise(resolve => resolve(query?.media[0] ?? null));
    }

    public static stripHtmlTag(text: string): string {
        return text.replace(/(?:<(?:[^>]+)>)/gi, "").replace(/&quot;/g, "\"").replace(/&#8213;/g, "--");
    }

    public static parseAnimeDate(date: Record<string, number | null | undefined> | null): string | null {
        if (!date?.year || !date.month || !date.day) return null;
        return moment({ year: date.year, month: date.month - 1, day: date.day }).format("D MMMM YYYY");
    }
}
