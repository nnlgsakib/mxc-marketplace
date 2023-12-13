import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

export default NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_ID!,
      clientSecret: process.env.TWITTER_SECRET!,
      version: '2.0',
    })
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      console.log('jwt', { token, account, profile })
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.id = account.userId || (profile as any)?.id || user.id
      }
      return token
    },
    session({ session, token, user }) {
      console.log('session', { session, token, user })

      // Send properties to the client, like an access_token and user id from a provider.
      if (session && session.user)
        // @ts-expect-error
        session.user.email = token?.id || user?.id
      
      return session
    },
  },
  secret: 'e4c972eb07ac063727a910f072f80ab4'
});

