//Internal libs and config
import config from '../config';
import _ from 'lodash';
import matter from './Matter';

//Actions and Classes
import {
	Accounts,
	Account,
	Groups
} from '../actions';
import Group from './Group';
import Files from './Files';
import File from './File';

//External Libs
import Firebase from 'firebase';
//Convenience vars
const {request, logger} = matter.utils;
/**
 * Application class.
 *
 */
class Application {
	constructor(appData) {
		console.log('files in group:', Files);
		//Setup application data based on input
		if (appData && _.isObject(appData)) {
			_.extend(this, appData);
		} else if (appData && _.isString(appData)) {
			this.name = appData;
		}
		if (Firebase && _.has(config, 'fbUrl') && _.has(this, 'name')) {
			this.fbUrl = `${config.fbUrl}/${this.name}`;
			this.fbRef = new Firebase(this.fbUrl);
		}
		// logger.debug({description: 'Application object created.', application: this, func: 'constructor', obj: 'Application'});
	}
	get appEndpoint() {
		return `${matter.endpoint}/apps/${this.name}`;
	}
	//Get applications or single application
	get() {
		logger.debug({
			description: 'Application get called.', func: 'get', obj: 'Application'
		});
		return request.get(this.appEndpoint).then((response) => {
			logger.info({
				description: 'Application loaded successfully.', response: response,
				application: new Application(response), func: 'get', obj: 'Application'
			});
			return new Application(response);
		})['catch']((errRes) => {
			logger.error({
				description: 'Error getting Application.',
				message: errRes.response.text ,error: errRes,
				func: 'get', obj: 'Application'
			});
			return Promise.reject(errRes.response.text || errRes.response);
		});
	}
	//Update an application
	update(appData) {
		logger.debug({
			description: 'Application update called.',
			func: 'update', obj: 'Application'
		});
		return request.put(this.appEndpoint, appData).then((response) => {
			logger.info({
				description: 'Application updated successfully.',
				response: response, func: 'update', obj: 'Application'
			});
			return new Application(response);
		})['catch']((errRes) => {
			logger.error({
				description: 'Error updating application.',
				error: errRes, func: 'update', obj: 'Application'
			});
			return Promise.reject(errRes.response.text || errRes.response);
		});
	}
	addStorage() {
		logger.debug({
			description: 'Application add storage called.', application: this,
			func: 'addStorage', obj: 'Application'
		});
		return request.post(`${this.appEndpoint}/storage`, {}).then((response) => {
			logger.info({
				description: 'Storage successfully added to application.',
				response: response, application: new Application(response),
				func: 'addStorage', obj: 'Application'
			});
			return new Application(response);
		})['catch']((errRes) => {
			logger.error({
				description: 'Error adding storage to application.',
				error: errRes, func: 'addStorage', obj: 'Application'
			});
			return Promise.reject(errRes.response.text || errRes.response);
		});
	}
	applyTemplate() {
		logger.error({
			description: 'Applying templates to existing applications is not currently supported.',
			func: 'applyTemplate', obj: 'Application'
		});
		return request.post(this.appEndpoint, {}).then((response) => {
			logger.info({
				description: 'Template successfully applied to application.',
				response: response, application: this,
				func: 'applyTemplate', obj: 'Application'
			});
			return new Application(response);
		})['catch']((errRes) => {
			logger.error({
				description: 'Error applying template to application.',
				error: errRes, application: this,
				func: 'applyTemplate', obj: 'Application'
			});
			return Promise.reject(errRes.response.text || errRes.response);
		});
	}
	//Files object that contains files methods
	get Files() {
		logger.debug({
			description: 'Applications files action called.',
			application: this, func: 'files', obj: 'Application'
		});
		return new Files({app: this});
	}
	File(fileData) {
		logger.debug({
			description: 'Applications file action called.',
			fileData: fileData, application: this,
			func: 'file', obj: 'Application'
		});
		return new File({app: this, fileData: fileData});
	}
	get Users() {
		logger.debug({
			description: 'Applications users action called.',
			application: this, func: 'user', obj: 'Application'
		});
		return new Accounts({app: this});
	}
	User(userData) {
		logger.debug({
			description: 'Applications user action called.',
			userData: userData, application: this, func: 'user',
			obj: 'Application'
		});
		return new Account({app: this, userData: userData});
	}
	get Accounts() {
		logger.debug({
			description: 'Applications account action called.',
			application: this, func: 'user', obj: 'Application'
		});
		return new Accounts({app: this});
	}
	Account(userData) {
		logger.debug({
			description: 'Applications account action called.',
			userData: userData, application: this,
			func: 'user', obj: 'Application'
		});
		return new Account({app: this, userData: userData});
	}
	get Groups() {
		logger.debug({
			description: 'Applications groups action called.',
			application: this, func: 'groups', obj: 'Application'
		});
		return new Groups({app: this});
	}
	Group(groupData) {
		logger.debug({
			description: 'Applications group action called.',
			groupData: groupData, application: this,
			func: 'group', obj: 'Application'
		});
		return new Group({app: this, groupData: groupData});
	}
}

export default Application;
