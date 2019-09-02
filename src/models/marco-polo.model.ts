import { Member } from '@/models/member.model';
export class MarcoPoloPlayer extends Member {
    constructor(
        public username: string,
        public email: string,
        public character: string,
        public points: number,
        public placement: number | undefined) {
        super(username, email);
    }
}

export class MarcoPoloGame {
    constructor(public players: MarcoPoloPlayer[], public time: number) {

    }
}