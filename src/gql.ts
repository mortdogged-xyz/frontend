import {createClient} from 'urql';
import {getUserData} from './SimpleAuth';

// let url = 'https://us-central1-tft-meta-73571.cloudfunctions.net/graphql';
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
    auth { uid, email, jwt },
    status,
    message
  }
}
`;

export interface LoginData {
  uid: string;
  email: string | null;
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

export const submitMutation = `
mutation($data: String!, $storageKey: String!) {
  submit(payload: {data: $data, storageKey: $storageKey}) {
    status,
    message
  }
}
`;

export interface SubmitMutationResponse {
  submit: {
    message: string;
    status: number;
  };
}

export const exportResultsQuery = `
query($storageKey: String!, $letLemmingsIn: Boolean){
  exportResults(storageKey: $storageKey, letLemmingsIn: $letLemmingsIn)
}
`;

export interface ExportResultsResponse {
  exportResults: string | null;
}

export const getSavedResultsQuery = `
query($storageKey: String!, $userId: String){
  getSavedResults(storageKey: $storageKey, userId: $userId)
}
`;

export interface GetSavedResultsResponse {
  getSavedResults: string | null;
}

export const viewSavedResultsQuery = `
query($storageKey: String!, $userId: String!){
  viewSavedResults(storageKey: $storageKey, userId: $userId)
}
`;

export interface ViewSavedResultsResponse {
  viewSavedResults: string | null;
}
