import { RegistrationUser } from "../util/graphql/registrationQuery";

export class Participant extends RegistrationUser {
    tags: string[];
}