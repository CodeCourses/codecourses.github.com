define(function(require, exports, module) {

	var GitHub = require("github").GitHub;

	function convertRepository(json) {
		return {
			courseCode: json.name,
			courseName: json.description,
			htmlRepositoryUrl: json.html_url
		};
	}

	exports.GitHubAdapter = {
		getOrganizationRepositories: function(organization, callback) {
			GitHub.getOrganizationRepositories(organization, function(repositories) {
				callback(repositories.map(convertRepository));
			});
		},
		getRepositoryFiles: function(organization, repositoryName, callback) {
			GitHub.getRepositoryFiles(organization, repositoryName, function(files) {
				callback(files.map( function(file) {
					return {
						url: file._links.html + "?raw=true",
						name: file.name
					};
				}));
			});
		},
		getRepository: function(organization, respositoryName, callback) {
			GitHub.getRepository(organization, respositoryName, function(repository) {
				callback(convertRepository(repository));
			});
		}
	};

});