define(function(require, exports, module) {

	var GITHUB_HOST = "https://api.github.com";

	exports.GitHub = {
		getOrganizationRepositories: function(organization, callback) {
			$.get(GITHUB_HOST + "/orgs/" + organization + "/repos", callback);
		},
		getRepositoryFiles: function(organization, respositoryName, callback) {
			$.get(GITHUB_HOST + "/repos/" + organization + "/" + respositoryName + "/contents/", callback);
		},
		getRepository: function(organization, respositoryName, callback) {
			$.get(GITHUB_HOST + "/repos/" + organization + "/" + respositoryName, callback);
		}
	};

});