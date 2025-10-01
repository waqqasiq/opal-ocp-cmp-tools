import axios from 'axios';
import { CMP_BASE_URL } from './config';
import { AuthData } from './types/auth';


function generateNumericId() {
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += Math.floor(Math.random() * 10); // digits 0-9
  }
  return id;
}


// helper to get task brief details from  CMP
export const getTaskDetailsFromCMP = async (
  taskId: string,
  authData: AuthData
) => {
  try {
    const headers = {
      Accept: "application/json",
      "x-auth-token-type": "opti-id",
      Authorization: `${authData.credentials.token_type} ${authData.credentials.access_token}`,
      "Accept-Encoding": "gzip",
      "x-request-id": generateNumericId(),
      "x-org-sso-id": authData.credentials.org_sso_id,
    };

    const url = `${CMP_BASE_URL}/v3/tasks/${taskId}/brief`;

    const res = await axios.get(url, { headers });
    return res.data;
  } catch (error: any) {
    console.error(`Failed to get task ${taskId}`, error.message);
    throw error;
  }
};
