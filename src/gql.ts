import {createClient} from 'urql';
import {getUserData} from './SimpleAuth';

let url = '/graphql';

if (process.env.NODE_ENV !== 'production') {
  url = 'http://localhost:5001/tft-meta-73571/us-central1/graphql';
}

export const gqlClient = createClient({
  url,
  fetchOptions: () => {
    const auth = getUserData();
    return {
      headers: {authorization: auth ? `Bearer ${JSON.stringify(auth)}` : ''},
    };
  },
});

export const loginMutation = `
mutation($email: String!, $password: String!) {
  login(auth: {email: $email, password: $password}) {
    auth { uid, jwt },
    status,
    message
  }
}
`;

export interface LoginData {
  uid: string;
  ts: number;
  token?: string;
  jwt?: string;
}

export interface LoginMutationResponse {
  login: {
    auth: LoginData;
    message: string;
    status: number;
  };
}
