import { Member } from "./member.model";

// Base class for all specific game players
export interface Player {
  user: Member;
  placement: number;
  points: number;
}
