var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('kyper-matter'), require('lodash')) : typeof define === 'function' && define.amd ? define(['kyper-matter', 'lodash'], factory) : global.Grout = factory(global.Matter, global.lodash);
})(this, function (Matter, lodash) {
	'use strict';

	Matter = 'default' in Matter ? Matter['default'] : Matter;

	var Actions = Object.defineProperties({}, {
		Accounts: {
			get: function get() {
				return Accounts;
			},
			configurable: true,
			enumerable: true
		},
		Account: {
			get: function get() {
				return Account;
			},
			configurable: true,
			enumerable: true
		},
		Projects: {
			get: function get() {
				return Projects;
			},
			configurable: true,
			enumerable: true
		},
		Project: {
			get: function get() {
				return Project;
			},
			configurable: true,
			enumerable: true
		},
		Groups: {
			get: function get() {
				return Groups;
			},
			configurable: true,
			enumerable: true
		},
		Group: {
			get: function get() {
				return Group;
			},
			configurable: true,
			enumerable: true
		},
		Templates: {
			get: function get() {
				return Templates;
			},
			configurable: true,
			enumerable: true
		},
		Template: {
			get: function get() {
				return Template;
			},
			configurable: true,
			enumerable: true
		}
	});

	var config = {
		serverUrl: 'http://tessellate.elasticbeanstalk.com',
		tokenName: 'grout',
		fbUrl: 'https://kyper-tech.firebaseio.com/tessellate',
		appName: 'tessellate',
		matterOptions: {
			localServer: false,
			logLevel: 'trace'
		},
		aws: {
			region: 'us-east-1',
			cognito: {
				poolId: 'us-east-1:72a20ffd-c638-48b0-b234-3312b3e64b2e',
				params: {
					AuthRoleArn: 'arn:aws:iam::823322155619:role/Cognito_TessellateUnauth_Role',
					UnauthRoleArn: 'arn:aws:iam::823322155619:role/Cognito_TessellateAuth_Role'
				}
			}
		}
	};

	var matter = new Matter(config.appName, config.matterOptions);

	var logger = matter.utils.logger;
	var request = matter.utils.request;

	var _Action = (function () {
		function _Action(actionName, actionData) {
			_classCallCheck(this, _Action);

			this.name = actionName;
			this.init(actionData);
		}

		/**
   * @description Initialize action
   * @param {Object} actionData - Data with which to initialize action
   */

		_createClass(_Action, [{
			key: 'init',
			value: function init(actionData) {
				logger.log({
					description: 'Init action called.',
					actionData: actionData, func: 'url', obj: 'Action'
				});
				if (!actionData || !actionData.app) {
					logger.error({
						description: 'Action data with app is required.',
						actionData: actionData, func: 'url', obj: 'Action'
					});
					throw Error('Action data with app is required.');
				}
				this.isList = actionData ? false : true;
				this.app = actionData.app;
				if (!this.isList) {
					this.actionData = actionData;
					this.callData = actionData.callData || {};
					if (lodash.isString(actionData)) {
						//String username provided
						this.id = this.actionData;
					} else {
						logger.warn({
							description: 'Invalid action data object.',
							func: 'constructor', obj: 'Action'
						});
						this.isList = false;
						// return Promise.reject('Invalid this.actionData');
					}
				}
			}

			/**
    * @description Build endpoint in the form of an array
    * @return {Array}
    */
		}, {
			key: 'get',

			/** Get
    * @return {Promise}
    */
			value: function get() {
				return request.get(this.url).then(function (res) {
					logger.log({
						description: 'Get responded successfully.',
						res: res, func: 'get', obj: 'Action'
					});
					if (lodash.has(res, 'error')) {
						logger.error({
							description: 'Error in get response.', error: res.error,
							res: res, func: 'get', obj: 'Action'
						});
						return Promise.reject(res.error);
					}
					return res.collection ? res.collection : res;
				}, function (error) {
					logger.error({
						description: 'Error in GET request.', error: error,
						func: 'get', obj: 'Action'
					});
					return Promise.reject(error);
				});
			}

			/** Add
    * @param {Object} newData - Object containing data to create with
    * @return {Promise}
    */
		}, {
			key: 'add',
			value: function add(newData) {
				return request.post(this.url, newData).then(function (res) {
					logger.log({
						description: 'Add request responded successfully.',
						res: res, func: 'add', obj: 'Action'
					});
					if (lodash.has(res, 'error')) {
						logger.error({
							description: 'Error creating new user.', error: res.error,
							res: res, func: 'add', obj: 'Action'
						});
						return Promise.reject(res.error);
					}
					logger.log({
						description: 'Add successful.', res: res,
						func: 'add', obj: 'Action'
					});
					return res;
				}, function (err) {
					logger.error({
						description: 'Error creating new user.',
						error: err, func: 'add', obj: 'Action'
					});
					return Promise.reject(err);
				});
			}

			/** Update
    * @param {Object} updateData - Object containing data with which to update
    * @return {Promise}
    */
		}, {
			key: 'update',
			value: function update(updateData) {
				return request.put(this.url, updateData).then(function (res) {
					if (lodash.has(res, 'error')) {
						logger.error({
							description: 'Error in update request.',
							error: res.error, res: res, func: 'update', obj: 'Action'
						});
						return Promise.reject(res.error);
					}
					logger.log({
						description: 'Update successful.', res: res,
						func: 'update', obj: 'Action'
					});
					return res;
				}, function (err) {
					logger.error({
						description: 'Error in update request.',
						error: err, func: 'update', obj: 'Action'
					});
					return Promise.reject(err);
				});
			}

			/** Remove
    * @return {Promise}
    */
		}, {
			key: 'remove',
			value: function remove() {
				return request.del(this.url).then(function (res) {
					if (lodash.has(res, 'error')) {
						logger.error({
							description: 'Error in request for removal.',
							error: res.error, res: res, func: 'remove', obj: 'Action'
						});
						return Promise.reject(res.error);
					}
					logger.log({
						description: 'Remove successfully.',
						res: res, func: 'remove', obj: 'Action'
					});
					return res;
				}, function (err) {
					logger.error({
						description: 'Error in request for removal.',
						error: err, func: 'remove', obj: 'Action'
					});
					return Promise.reject(err);
				});
			}
		}, {
			key: 'endpointArray',
			get: function get() {
				var endpointArray = [matter.endpoint, this.name];
				if (_.has(this, 'app') && _.has(this.app, 'name') && this.app.name !== config.appName) {
					//Splice apps, appName into index 1
					endpointArray.splice(1, 0, 'apps', this.app.name);
				}
				return endpointArray;
			}

			/** url
    * @description Action url
    * @return {String}
    */
		}, {
			key: 'url',
			get: function get() {
				logger.log({
					description: 'Url created.', url: this.endpointArray.join('/'),
					func: 'url', obj: 'Action'
				});
				return this.endpointArray.join('/');
			}
		}]);

		return _Action;
	})();

	var Accounts = (function (_Action2) {
		_inherits(Accounts, _Action2);

		function Accounts(actionData) {
			_classCallCheck(this, Accounts);

			_get(Object.getPrototypeOf(Accounts.prototype), 'constructor', this).call(this, 'accounts', actionData);
		}

		return Accounts;
	})(_Action);

	var Account = (function (_Action3) {
		_inherits(Account, _Action3);

		function Account(actionData) {
			_classCallCheck(this, Account);

			_get(Object.getPrototypeOf(Account.prototype), 'constructor', this).call(this, 'account', actionData);
		}

		return Account;
	})(_Action);

	var Projects = (function (_Action4) {
		_inherits(Projects, _Action4);

		function Projects(actionData) {
			_classCallCheck(this, Projects);

			_get(Object.getPrototypeOf(Projects.prototype), 'constructor', this).call(this, 'apps', actionData);
		}

		return Projects;
	})(_Action);

	var Project = (function (_Action5) {
		_inherits(Project, _Action5);

		function Project(actionData) {
			_classCallCheck(this, Project);

			_get(Object.getPrototypeOf(Project.prototype), 'constructor', this).call(this, 'app', actionData);
		}

		return Project;
	})(_Action);

	var Groups = (function (_Action6) {
		_inherits(Groups, _Action6);

		function Groups(actionData) {
			_classCallCheck(this, Groups);

			_get(Object.getPrototypeOf(Groups.prototype), 'constructor', this).call(this, 'groups', actionData);
		}

		return Groups;
	})(_Action);

	var Group = (function (_Action7) {
		_inherits(Group, _Action7);

		function Group(actionData) {
			_classCallCheck(this, Group);

			_get(Object.getPrototypeOf(Group.prototype), 'constructor', this).call(this, 'group', actionData);
		}

		return Group;
	})(_Action);

	var Templates = (function (_Action8) {
		_inherits(Templates, _Action8);

		function Templates(actionData) {
			_classCallCheck(this, Templates);

			_get(Object.getPrototypeOf(Templates.prototype), 'constructor', this).call(this, 'templates', actionData);
		}

		return Templates;
	})(_Action);

	var Template = (function (_Action9) {
		_inherits(Template, _Action9);

		function Template(actionData) {
			_classCallCheck(this, Template);

			_get(Object.getPrototypeOf(Template.prototype), 'constructor', this).call(this, 'template', actionData);
		}

		/**Grout Client Class
   * @description Extending matter provides token storage and login/logout/signup capabilities
   */
		return Template;
	})(_Action);

	var Grout = (function (_Matter) {
		_inherits(Grout, _Matter);

		//TODO: Use getter/setter to make this not a function

		function Grout(appName, groutOptions) {
			_classCallCheck(this, Grout);

			//Call matter with tessellate
			var name = appName && lodash.isString(appName) ? appName : config.appName;
			var options = groutOptions && lodash.isObject(groutOptions) ? groutOptions : config.matterOptions;
			_get(Object.getPrototypeOf(Grout.prototype), 'constructor', this).call(this, name, options);
		}

		//Start a new Projects Action

		_createClass(Grout, [{
			key: 'Project',

			//Start a new Project action
			value: function Project(projectName) {
				this.utils.logger.debug({
					description: 'Project action called.',
					projectName: projectName, func: 'Projects', obj: 'Grout'
				});
				return new Actions.Project({ app: this, callData: projectName });
			}

			//Start a new Apps Action
		}, {
			key: 'Template',

			//Start a new App action
			value: function Template(templateData) {
				this.utils.logger.debug({
					description: 'Template Action called.', templateData: templateData,
					template: new Actions.Template({ app: this, callData: templateData }), func: 'Template', obj: 'Grout'
				});
				return new Actions.Template({ app: this, callData: templateData });
			}

			//Start a new Accounts action
		}, {
			key: 'Account',

			//Start a new Account action
			value: function Account(userData) {
				this.utils.logger.debug({
					description: 'Account Action called.',
					userData: userData, user: new Actions.Account({ app: this, callData: userData }),
					func: 'user', obj: 'Grout'
				});
				return new Actions.Account({ app: this, callData: userData });
			}

			//ALIAS OF ACCOUNTS
			//Start a new Accounts action
		}, {
			key: 'User',

			//ALIAS OF ACCOUNT
			//Start a new Account action
			value: function User(userData) {
				this.utils.logger.debug({
					description: 'Account Action called.',
					userData: userData, user: new Actions.Account({ app: this, callData: userData }),
					func: 'user', obj: 'Grout'
				});
				return new Actions.Account({ app: this, callData: userData });
			}

			//Start a new Groups action
		}, {
			key: 'Group',

			//Start a new Group action
			value: function Group(groupData) {
				this.utils.logger.debug({
					description: 'Group Action called.', groupData: groupData,
					action: new Action.Group({ app: this, groupData: groupData }),
					func: 'group', obj: 'Grout'
				});
				return new Action.Group({ app: this, groupData: groupData });
			}
		}, {
			key: 'Projects',
			get: function get() {
				this.utils.logger.debug({
					description: 'Projects Action called.', action: new Actions.Projects({ app: this }),
					func: 'Projects', obj: 'Grout'
				});
				return new Actions.Projects({ app: this });
			}
		}, {
			key: 'Templates',
			get: function get() {
				this.utils.logger.debug({
					description: 'Templates Action called.',
					func: 'Templates', obj: 'Grout'
				});
				return new Actions.Templates({ app: this });
			}
		}, {
			key: 'Accounts',
			get: function get() {
				this.utils.logger.debug({
					description: 'Account Action called.',
					action: new Actions.Accounts({ app: this }), func: 'users', obj: 'Grout'
				});
				return new Actions.Accounts({ app: this });
			}
		}, {
			key: 'Users',
			get: function get() {
				this.utils.logger.debug({
					description: 'Accounts Action called.',
					action: new Actions.Accounts({ app: this }), func: 'Users', obj: 'Grout'
				});
				return new Actions.Accounts({ app: this });
			}
		}, {
			key: 'Groups',
			get: function get() {
				this.utils.logger.debug({
					description: 'Groups Action called.',
					action: new Action.Groups({ app: this }), func: 'groups', obj: 'Grout'
				});
				return new Action.Groups({ app: this });
			}
		}]);

		return Grout;
	})(Matter);

	return Grout;
});
//# sourceMappingURL=grout.js.map
