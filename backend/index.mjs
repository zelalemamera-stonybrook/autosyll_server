/* lambda handler for the server application
*/

import {exec} from 'node:child_process';

exports.handler = async (event) => {
	let shell = await exec('echo "hello from shell"');
	console.log(shell);
	const response = {
		statusCode: 200,
		body: JSON.stringify('finished'),
    };
    	return response;
};