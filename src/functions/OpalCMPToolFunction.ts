import { logger, Function, Response } from '@zaiusinc/app-sdk';
import { getTaskDetailsFromCMP } from '../cmp';
// import { AuthSection } from '../data/data';


interface TaskBriefParameters {
  task_id: string;
}
interface OptiAuthData {
  provider: string;
  credentials: {
    token_type: string;
    access_token: string;
    org_sso_id: string;
    user_id: string;
    instance_id: string;
    customer_id: string;
    product_sku: string;
  };
}

// Define Opal tool metadata  - list of tools and their parameters
const discoveryPayload = {
  'functions': [
    {
      'name': 'get_task_brief',
      'description': 'Get Details of the Task Brief from CMP',
      'parameters': [
        {
          'name': 'task_id',
          'type': 'string',
          'description': 'The task ID in CMP',
          'required': true
        }
      ],
      'endpoint': '/tools/get-task-brief',
      'http_method': 'POST',
      'auth_requirements': [
        {
          'provider': 'OptiID',
          'scope_bundle': 'default',
          'required': true
        }
      ]
    }
  ]
};

/**
 * class that implements the Opal tool functions. Requirements:
 * - Must extend the Function class from the SDK
 * - Name must match the value of entry_point property from app.yml manifest
 * - Name must match the file name
 */
export class OpalCMPToolFunction extends Function {

  /**
   * Processing the request from Opal
   * Add your logic here to handle every tool declared in the discoveryPayload.
   */
  public async perform(): Promise<Response> {
    // uncomment the following lines to enable bearer token authentication
    /*
    const bearerToken = (await storage.settings.get('bearer_token')).bearer_token as string;
    if (bearerToken && this.request.headers.get('Authorization') !== `Bearer ${bearerToken}`) {
      logger.warn('Invalid or missing bearer token', JSON.stringify(this.request));
      return new Response(401, 'Invalid or missing bearer token');
    }
    */

    /*
     * example: fetching configured username/password credentials
     *
    const auth = await storage.settings.get<AuthSection>('auth');
    */

    /*
     * example: fetching Google Oauth token from secret storage
     *
     const token = await storage.secrets.get<Token>('token');
     */

    if (this.request.path === '/discovery') {
      return new Response(200, discoveryPayload);
    } else if (this.request.path === '/tools/get-task-brief') {
      console.log('Request body:', this.request.bodyJSON);
      console.log('Request headers:', this.request.headers);

      const params = this.extractParameters() as TaskBriefParameters;
      const authData = this.extractAuthData() as OptiAuthData;
      const response = this.getTaskBriefDetails(params, authData);
      return new Response(200, response);
    } else {
      return new Response(400, 'Invalid path');
    }
  }

  private extractParameters() {
    // Extract parameters from the request body
    if (this.request.bodyJSON && this.request.bodyJSON.parameters) {
      // Standard format: { "parameters": { ... } }
      logger.info('Extracted parameters from \'parameters\' key:', this.request.bodyJSON.parameters);
      return this.request.bodyJSON.parameters;
    } else {
      // Fallback for direct testing: { "name": "value" }
      logger.warn('\'parameters\' key not found in request body. Using body directly.');
      return this.request.bodyJSON;
    }
  }

  private extractAuthData() {
    // Extract auth data from the request headers
    if (this.request.bodyJSON && this.request.bodyJSON.auth) {
      // Standard format: { "parameters": { ... } }
      logger.info('Extracted authData from \'auth\' key:', this.request.bodyJSON.auth);
      return this.request.bodyJSON.auth;
    } else {
      // Fallback for direct testing: { "name": "value" }
      logger.warn('\'auth\' key not found in request body. Using body directly.');
      return this.request.bodyJSON;
    }
  }

  /**
   * The logic of the tool goes here.
   */
  private async getTaskBriefDetails(parameters: TaskBriefParameters, authData: OptiAuthData) {
    const { task_id } = parameters;

    try {
      if (!task_id) {
        throw new Error('Missing required parameter: task_id');
      }

      const brief = await getTaskDetailsFromCMP(task_id, authData);
      return { brief };

    } catch (error: any) {
      console.error('Error fetching CMP task brief:', error.message);
      throw new Error('Failed to fetch CMP task brief');
    }
  }
}
