import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Wallet',
      credentials: {
        wallet: { label: 'Wallet Address', type: 'text' },
        email: { label: 'Email', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials: Record<'wallet' | 'email' | 'signature', string> | undefined) {
        if (!credentials?.wallet && !credentials?.email) {
          return null;
        }

        // In production, verify the signature against the wallet address
        // For now, we'll do a simple lookup/create
        let user;
        if (credentials.wallet) {
          user = await prisma.user.findUnique({
            where: { wallet: credentials.wallet },
          });
          if (!user) {
            user = await prisma.user.create({
              data: {
                wallet: credentials.wallet,
                email: credentials.email || `wallet_${credentials.wallet.slice(0, 8)}@example.com`,
              },
            });
          }
        } else if (credentials.email) {
          user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: credentials.email,
              },
            });
          }
        }

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          wallet: user.wallet,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.wallet = (user as any).wallet;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).wallet = token.wallet;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
};

