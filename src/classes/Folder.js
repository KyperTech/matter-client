import { extend, has, isString, isObject, last } from 'lodash';
import FileSystemEntity from './FileSystemEntity';
import matter from './Matter';
const { logger } = matter.utils;
class Folder extends FileSystemEntity {
	constructor(project, path, name) {
		super(project, path, name);
		this.entityType = 'folder';
	}

	/**
	 * @description Add folder to project
	 * @return {Promise}
	 */
	save() {
		return this.addToFb();
	}

}

export default Folder;
