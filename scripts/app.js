define(function (require) {

	var PROMOTIONS = ["B1", "B2", "B3", "M1", "M2"];
	var ORGANIZATION = "CodeCourses";

	var Mustache = require("lib/mustache");
	var GitHub = require("github_adapter").GitHubAdapter;

	$(function() {

		function displayPromotion(promotion, year) {
			$.get('templates/promotion.mustache', function(template) {
				var html = Mustache.to_html(template, { 
					name: promotion,
					year: year
				});
				if($("section[id|='#promotion']").length) {
					for(var index = 1; index <= PROMOTIONS.length; index += 1) {
						var currentPromotion = $("#promotion_" + index);
						if(currentPromotion.length && year < index) {
							currentPromotion.before(html);
						}
					}
				} else {
					$("div[data-role='content']").append(html);
				}
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

		function isValidCourse(courseYear) {
			return typeof courseYear === "number" && courseYear > 0 && courseYear < PROMOTIONS.length;
		}

		PROMOTIONS.forEach( function(promotion, index) {
			displayPromotion(promotion, index + 1);
		});

		GitHub.getOrganizationRepositories(ORGANIZATION, function(repositories) {
			repositories.forEach( function(repository) {
				var courseCode = repository.courseCode;
				var courseYear = parseInt(courseCode.charAt(0));
				if(isValidCourse(courseYear)) {
					displayCourse(courseYear, repository, function() {
						GitHub.getRepositoryFiles(ORGANIZATION, courseCode, function(files) {
							files.forEach( function(file) {
								displayCourseFile(courseCode, file);
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