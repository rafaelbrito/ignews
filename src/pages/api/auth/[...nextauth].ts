import NextAuth, { Account, Profile, User } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { fauna } from '../../../services/fauna';
import { query as q } from 'faunadb'
import { AdapterUser } from "next-auth/adapters";

export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            authorization: {
                params: {
                    scope: "read:user"
                }
            }
        }),
    ],
    callbacks: {
        async signIn(params: {
            user: User | AdapterUser;
            account: Account | null;
            profile?: Profile;
            email?: {
                verificationRequest?: boolean;
            };
            credentials?: Record<string, unknown>;
        }) {
            const { email } = params.user;

            try {
                await fauna.query(
                    q.If(
                        q.Not(
                            q.Exists(
                                q.Match(
                                    q.Index('user_by_email'),
                                    q.Casefold(params.user.email!)
                                )
                            )
                        ),
                        q.Create(
                            q.Collection('users'),
                            { data: { email } }
                        ),
                        q.Get(
                            q.Match(
                                q.Index('user_by_email'),
                                q.Casefold(params.user.email!)
                            )
                        )
                    )
                )
                return true
            }
            catch {
                return false;
            }
        },
    }
}

export default NextAuth(authOptions)