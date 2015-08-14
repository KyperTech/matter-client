import Firebase from 'firebase';
import AWS from 'aws';
import _ from 'underscore';
import axios from 'axios';
let user;
let token;
const config = {
	serverUrl:'http://localhost:4000',
	tokenName: 'matter-client',
	fbUrl:'https://pruvit.firebaseio.com',
	aws:{
		region:'us-east-1',
		cognito:{
			poolId:'us-east-1:7f3bc1ff-8484-48dd-9e13-27e5cd3de982',
			params:{
				RoleArn:'arn:aws:iam::823322155619:role/Cognito_HypercubeTestAuth_Role1'
			} 
		}
	}
	
};

if (typeof Firebase == 'undefined') {
	console.error('Firebase is required to use Matter');
}
if (typeof AWS == 'undefined') {
	console.error('AWS is required to use Matter');
}
if (typeof _ == 'undefined') {
	console.error('Underscore is required to use Matter');
}
if (typeof axios == 'undefined') {
	console.error('Axios is required to use Matter');
} else {
	// Add a request interceptor
	axios.interceptors.request.use(function(config) {
		// Do something before request is sent
		//TODO: Handle there already being headers
		if (typeof window != 'undefined' && window.sessionStorage.getItem(tokenName)) {
			config.headers = {'Authorization': 'Bearer ' + sessionStorage.getItem(tokenName)};
			console.log('Set auth header through interceptor');
		}
		return config;
	}, function(error) {
		// Do something with request error
		return Promise.reject(error);
	});
}
class Application {
	constructor(appData) {
		this.name = appData.name;
		this.owner = appData.owner || null;
		this.collaborators = appData.collaborators || [];
		this.createdAt = appData.createdAt;
		this.updatedAt = appData.updatedAt;
		this.frontend = appData.frontend || {};
		this.backend = appData.backend || {};
		if (Firebase) {
			this.fbRef = new Firebase(config.fbUrl + appData.name);
		}
	}
	getStructure() {
		//TODO:Get files list and convert to structure
		this.getFiles().then(function(){

		});
	}
	getFiles() {
		//TODO:Get files list from S3
		if(!this.frontend){
	  	console.error("[Applicaiton.getFiles] Attempting to get objects for bucket without name.");
			return Promise.reject({message:'Bucket name required to get objects'});
		} else {
			//If AWS Credential do not exist, set them
			if(typeof AWS.config.credentials == "undefined" || !AWS.config.credentials){
				// console.info('AWS creds are being updated to make request');
				setAWSConfig();
			}
			var s3 = new AWS.S3();
			var listParams = {Bucket:bucketName};
			return s3.listObjects(listParams, function(err, data) {
			  if (!err) { 
			  	console.log("[$s3.getObjects] listObjects returned:", data);
				  return Promise.resolve(data.Contents);
				}
			  else {
			  	console.error("[$s3.getObjects] Error listing objects:", err);
			    return Promise.reject(err);
			  }
			});
		}
	}
	publishFile(fileData) {
		if(!this.frontend){
			console.error('Frontend data not available. Call .get()?');
	    return Promise.reject({message:'Front end data is required to publish file'});
		}
		var saveParams = {Bucket:this.frontent.bucketName, Key:fileData.key,  Body: fileData.content, ACL:'public-read'};
	  //Set contentType from fileData to ContentType parameter of new object
	  if(fileData.contentType){
	  	saveParams.ContentType = fileData.contentType;
	  }
	  // console.log('[$aws.$saveFiles] saveParams:', saveParams);
	  return s3.putObject(saveParams, function(err, data){
	  	//[TODO] Add putting object ACL (make public)
	    if(!err){
	      console.log('[$aws.saveFile()] file saved successfully. Returning:', data);
	      return Promise.resolve(data);
	    } else {
	      console.error('[$aws.saveFile()] Error saving file:', err);
	      return Promise.reject(err);
	    }
	  });
	}
	addStorage() {
		//TODO:Add storage bucket
		var endpoint = config.serverUrl + "/apps/" + this.name + "/storage";
		return axios.post(endpoint, appData).then(function(response) {
			console.log('[Application.addStorage()] Apps:', response.data);
			if (!apps.isList) {
				return new Application(response.data);
			}
			return response.data;
		})['catch'](function(errRes) {
			console.error('[Application.addStorage()] Error getting apps list: ', errRes);
			return Promise.reject(errRes);
		});
	}
	applyTemplate() {
		var endpoint = config.serverUrl + "/apps/" + this.name + "/template";
		console.log('Applying templates to existing');
		// return axios.post(endpoint, appData).then(function(response) {
		// 	console.log('[Application.addStorage()] Apps:', response.data);
		// 	if (!apps.isList) {
		// 		return new Application(response.data);
		// 	}
		// 	return response.data;
		// })['catch'](function(errRes) {
		// 	console.error('[Application.addStorage()] Error getting apps list: ', errRes);
		// 	return Promise.reject(errRes);
		// });
	}
}
function setAWSConfig(){
	AWS.config.update({
	  credentials: new AWS.CognitoIdentityCredentials({
	  IdentityPoolId: config.aws.cognito.poolId
	  }),
	  region: config.aws.region
	});
}
class AppsAction {
	constructor(appName) {
		this.isList = true;
		this.endpoint = config.serverUrl + '/apps';
		if (appName) {
			this.name = appName;
			this.isList = false;
		}
	}

	get() {
		if (!this.isList) {
			this.endpoint += `/${this.name}`;
		}
		let self = this;
		return axios.get(this.endpoint).then(function(response) {
			console.log('[MatterClient.apps().get()] App(s) data loaded:', response.data);
			if (!self.isList) {
				return new Application(response.data);
			}
			return response.data;
		})['catch'](function(errRes) {
			console.error('[MatterClient.apps().get()] Error getting apps list: ', errRes);
			return Promise.reject(errRes);
		});
	}

	add(appData) {
		return axios.post(this.endpoint, appData).then(function(response) {
			console.log('[MatterClient.apps().add()] Apps:', response.data);
			if (!apps.isList) {
				return new Application(response.data);
			}
			return response.data;
		})['catch'](function(errRes) {
			console.error('[MatterClient.getApps()] Error getting apps list: ', errRes);
			return Promise.reject(errRes);
		});
	}

	update(appData) {
		if (this.isList) {
			console.error('Update action can only be applied to a specific application.');
			return Promise.reject({message:'Update action can only be applied to a specific application.'});
		}
		return axios.put(this.endpoint, appData).then(function(response) {
			console.log('[MatterClient.apps().update()] App:', response.data);
			if (!apps.isList) {
				return new Application(response.data);
			}
			return response.data;
		})['catch'](function(errRes) {
			console.error('[MatterClient.apps().update()] Error updating app: ', errRes);
			return Promise.reject(errRes);
		});
	}

	del(appData) {
		if (this.isList) {
			console.error('Delete action can only be applied to a specific application.');
			return Promise.reject({message:'Delete action can only be applied to a specific applicaiton.'});
		}
		return axios.delete(this.endpoint, appData).then(function(response) {
			console.log('[MatterClient.apps().del()] Apps:', response.data);
			if (!apps.isList) {
				return new Application(response.data);
			}
			return response.data;
		})['catch'](function(errRes) {
			console.error('[MatterClient.apps().del()] Error deleting app: ', errRes);
			return Promise.reject(errRes);
		});
	}
}
class MatterClient {
	constructor() {
	}
	//Signup a new user
	signup(signupData) {
		return axios.post(config.serverUrl + '/signup', signupData)
		.then(function(response) {
		  console.log(response);
		  return response.data;
		})
		['catch'](function(errRes) {
		  console.error('[MatterClient.signup()] Error signing up:', errRes);
		  return Promise.reject(errRes);
		});
	}
	//Login a user
	login(loginData) {
		if (!loginData || !loginData.password || !loginData.username) {
			console.error('Username/Email and Password are required to login.');
			return Promise.reject({message:'Username/Email and Password are required to login.'});
		}
		return axios.put(config.serverUrl + '/login', loginData)
		.then(function(response) {
			//TODO: Save token locally
			console.log('[MatterClient.login()]: Login response: ', response);
			token = response.data.token;
			if (window.sessionStorage.getItem(config.tokenName) === null) {
				window.sessionStorage.setItem(config.tokenName, response.data.token);
				console.log('[MatterClient.login()]: token set to storage:', window.sessionStorage.getItem(config.tokenName));
			}
			return response.data;
		})['catch'](function(errRes) {
			console.error('[MatterClient.login()] Error logging in: ', errRes);
			return Promise.reject(errRes);
		});
	}

	logout() {
		return axios.put(config.serverUrl + '/logout', {
		}).then(function(response) {
		  console.log('[MatterClient.logout()] Logout successful: ', response);
		  if (typeof window != 'undefined' && typeof window.sessionStorage.getItem(tokenName) != null) {
				//Clear session storage
				window.sessionStorage.clear();
			}
		  return response.body;
		})['catch'](function(errRes) {
		  console.error('[MatterClient.logout()] Error logging out: ', errRes);
		  return Promise.reject(errRes);
		});
	}

	getCurrentUser() {
		//TODO: Check Current user variable
		return axios.get(config.serverUrl + '/user', {
		}).then(function(response) {
			//TODO: Save user information locally
			console.log('[MatterClient.getCurrentUser()] Current User:', response.data);
			user = response.data;
			return user;
		})['catch'](function(errRes) {
			console.error('[MatterClient.getCurrentUser()] Error getting current user: ', errRes);
			return Promise.reject(errRes);
		});
	}

	getAuthToken() {
		//TODO: Load token from storage
		if (typeof window == 'undefined' || typeof window.sessionStorage.getItem(config.tokenName) == 'undefined') {
			return null;
		}
		return window.sessionStorage.getItem(config.tokenName);
	}

	apps(appName) {
		console.log('new apps:', new AppsAction(appName));
		return new AppsAction(appName);
	}

};

class File {
	constructor(fileData) {
		this.type = 'file';
		this.path = fileData.path;
		let pathArray = this.path.split('/');
		this.name = pathArray[pathArray.length - 1];
		let re = /(?:\.([^.]+))?$/;
		this.ext = re.exec(this.name)[1];
		console.log('new file constructed:', this);
	}
	getTypes() {
		//Get content type and file type from extension
	}
	open() {
		//TODO:Return file contents
	}
	openWithFirepad(divId) {
		//TODO:Create new Firepad instance within div
	}
	getDefaultContent() {

	}
}

class Folder {
	constructor(fileData) {
		this.type = 'folder';
		//TODO: Add path
	}
}

//Convert from array file structure (from S3) to "children" structure used in Editor GUI (angular-tree-control)
//Examples for two files (index.html and /testFolder/file.js):
//Array structure: [{path:"index.html"}, {path:"testFolder/file.js"}]
//Children Structure [{type:"folder", name:"testfolder", children:[{path:"testFolder/file.js", name:"file.js", filetype:"javascript", contentType:"application/javascript"}]}]
function childStructureFromArray(fileArray){
  // console.log('childStructureFromArray called:', fileArray);
  //Create a object for each file that stores the file in the correct "children" level
  var mappedStructure = fileArray.map(function (file){
    return buildStructureObject(file);
  });
  return combineLikeObjs(mappedStructure);
}
//Convert file with key into a folder/file children object
function buildStructureObject(file){
  var pathArray;
  console.log('buildStructure with:', file);
  if(_.has(file, 'path')){
    //Coming from files already having path (structure)
    pathArray = file.path.split("/");
  } else {
    //Coming from aws
    pathArray = file.Key.split("/");
    // console.log('file before pick:', file);
    file = _.pick(file, "Key");
    file.path = file.Key;
    file.name = file.Key;
  }
  var currentObj = file;
  if(pathArray.length == 1){
    currentObj.name = pathArray[0];
    if(!_.has(currentObj,'type')){
      currentObj.type = "file";
    } 
    currentObj.path = pathArray[0];
    return currentObj;
  } else {
    var finalObj = {};
    _.each(pathArray, function (loc, ind, list){
      if(ind != list.length - 1){ //Not the last loc
        currentObj.name = loc;
        currentObj.path = _.first(list, ind + 1).join("/");
        currentObj.type = "folder";
        currentObj.children = [{}];
        //TODO: Find out why this works
        if(ind == 0 ){
          finalObj = currentObj;
        }
        currentObj = currentObj.children[0];
      } else {
        currentObj.type = "file";
        currentObj.name = loc;
        currentObj.path = pathArray.join("/");
        if(file.$id){
          currentObj.$id = file.$id;
        }
      }
    });
    return finalObj;
  }
}
//Recursivley combine children of object's that have the same names
function combineLikeObjs() {
	var takenNames = [];
  var finishedArray = [];
  _.each(mappedArray, function(obj, ind, list){
    if(takenNames.indexOf(obj.name) == -1){
      takenNames.push(obj.name);
      finishedArray.push(obj);
    } else {
      var likeObj = _.findWhere(mappedArray, {name:obj.name});
      //Combine children of like objects
      likeObj.children = _.union(obj.children, likeObj.children);
      likeObj.children = combineLikeObjs(likeObj.children);
      // console.log('extended obj:',likeObj);
    }
  });
  return finishedArray;
}

export default MatterClient;
