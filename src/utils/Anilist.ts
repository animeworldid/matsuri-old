import got, { OptionsOfJSONResponseBody } from "got";
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

export interface AnilistResponse {
    data: {
        Page: AnilistAnimePage;
    };
}
export class Anilist {
    // eslint-disable-next-line class-methods-use-this
    public async query(query: string, variables: object): Promise<AnilistAnimePage | null> {
        const options: OptionsOfJSONResponseBody = {
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "Content-Type": "application/json; charset=utf-8",
                Accept: "application/json"
            },
            json: { query, variables }
        };
        const res: AnilistResponse = await got.post("https://graphql.anilist.co", options).json();
        return res.data.Page;
    }

    public async findAnimeByTitle(title: string): Promise<AnilistAnimePage | null> {
        return this.query(
            `query($title:String) {
  Page(perPage:10) {
    pageInfo {
      lastPage
      hasNextPage
    }
    media(search: $title, isAdult: false, type: ANIME) {
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
    media(id: $animeId, isAdult: false, type: ANIME) {
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

    public static truncateText(text: string, length: number): string {
        if (text.length < length + 3) return text;
        return `${text.slice(0, length + 3)}...`;
    }
}
