define(function (require) {

	var PROMOTIONS = ["B1", "B2", "B3", "M1", "M2"];
	var ORGANIZATION = "CodeCourses";

	var Mustache = require("lib/mustache");
	var GitHub = require("github").GitHub;

	$(function() {

		function displayPromotion(promotion, year, callback) {
			$.get('templates/promotion.mustache', function(template) {
				var html = Mustache.to_html(template, { 
					name: promotion,
					year: year
				});
				$("body").append(html);
				callback();
			});
		}

		function displayCourse(courseYear, course, callback) {
			$.get('templates/course.mustache', function(template) {
			    var html = Mustache.to_html(template, course);
			    $("#promotion_" + courseYear).append(html);
			    callback();
			});
		}

		function displayCourseFile(courseCode, file) {
			$.get('templates/course_file.mustache', function(template) {
			    var html = Mustache.to_html(template, file);
			    $("#course_" + courseCode + " > .course_files").append(html);
			});
		}

		PROMOTIONS.forEach( function(promotion, index) {
			displayPromotion(promotion, index + 1);
		});

		GitHub.getOrganizationRepositories(ORGANIZATION, function(repositories) {
			repositories.forEach( function(repository) {
				var courseCode = repository.name;
				var courseName = repository.description;
				var courseYear = parseInt(courseCode.charAt(0));
				if(typeof courseYear === "number" && courseYear > 0 && courseYear < PROMOTIONS.length) {
					displayCourse(courseYear, {
						code: courseCode,
						name: courseName,
						htmlRepositoryUrl: repository.html_url
					}, function() {
						GitHub.getRepositoryFiles(ORGANIZATION, courseCode, function(files) {
							files.forEach( function(file) {
								displayCourseFile(courseCode, {
									url: file._links.html + "?raw=true",
									name: file.name
								});
							});
						});
					});
				} else {
					console.log(repository.name + " is not a valid CodeCourses repository.");
				}
			});
		});
	});

});