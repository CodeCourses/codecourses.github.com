define(function(require, exports, module) {

	var GitHub = require("github").GitHub;

	exports.GitHubAdapter = {
		getOrganizationRepositories: function(organization, callback) {
			GitHub.getOrganizationRepositories(organization, function(repositories) {
				callback(repositories.map( function(repository) {
					return {
						courseCode: repository.name,
						courseName: repository.description,
						htmlRepositoryUrl: repository.html_url
					};
				}));
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
		}
	};

});