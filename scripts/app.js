define(function (require) {

	var PROMOTIONS = ["B1", "B2", "B3", "M1", "M2"];
	var ORGANIZATION = "CodeCourses";

	var Mustache = require("lib/mustache");
	var GitHub = require("github_adapter").GitHubAdapter;

	$(document).ready( function() {

		function displayPromotion(promotion, year) {
			$.get('templates/promotion.mustache', function(template) {
				var html = Mustache.to_html(template, { 
					name: promotion,
					year: year
				});
				if($("section[id^='#promotion_']").length) {
					for(var index = 1; index <= PROMOTIONS.length; index += 1) {
						var currentPromotion = $("#promotion_" + index);
						if(currentPromotion.length && year < index) {
							currentPromotion.before(html);
						}
					}
				} else {
					$("#main-page-content").append(html);
				}
			});
		}

		function displayCourse(courseYear, course, callback) {
			$.get('templates/course.mustache', function(template) {
			    var html = Mustache.to_html(template, course);
			    $("#promotion_" + courseYear + " .courses").append(html);
			    callback();
			});
		}

		function displayCourseFile(courseCode, file, callback) {
			$.get('templates/course_file.mustache', function(template) {
			    var html = Mustache.to_html(template, file);
			    $("#course-page .course_files").append(html);
			    callback();
			});
		}

		function isValidCourse(courseYear) {
			return typeof courseYear === "number" && courseYear > 0 && courseYear < PROMOTIONS.length;
		}


		PROMOTIONS.forEach( function(promotion, index) {
			displayPromotion(promotion, index + 1);
		});

		GitHub.getOrganizationRepositories(ORGANIZATION, function(repositories) {
			var repositoriesToDisplay = 0;
			repositories.forEach( function(repository) {
				var courseCode = repository.courseCode;
				var courseYear = parseInt(courseCode.charAt(0));
				if(isValidCourse(courseYear)) {
					repositoriesToDisplay += 1;
					displayCourse(courseYear, repository, function() {
						repositoriesToDisplay -= 1;
						if(repositoriesToDisplay === 0) {
							$("#main-page").page("destroy").page();
						}
					});
				} else {
					console.log(repository.name + " is not a valid CodeCourses repository.");
				}
			});
		});

		function displayCoursePage(courseCode) {
			$.mobile.changePage("#course-page", { changeHash: false });
			GitHub.getRepository(ORGANIZATION, courseCode, function(repository) {
				$("#course-page > header > h1 > span.courseCode").text(repository.courseCode);
				$("#course-page > a.repository").attr("href", repository.htmlRepositoryUrl);
				$("#course-page .course_files").html("");
				GitHub.getRepositoryFiles(ORGANIZATION, repository.courseCode, function(files) {
					var filesToDisplay = files.length;
					files.forEach( function(file) {
						displayCourseFile(repository.courseCode, file, function() {
							filesToDisplay -= 1;
							if(filesToDisplay === 0) {
								$('#course-page .course_files').listview('refresh');
							}
						});
					});
				});
			});
		}

		$(document).on("click", "li[id^='course_'] a", function(event) {
			var hash = $(this).attr("href");
			window.location.hash = hash;
			var courseCode = hash.substr(1);
			displayCoursePage(courseCode);
			event.preventDefault();
		});

		$("#main-page").bind("pagebeforecreate", function(event) {
			var hash = window.location.hash;
			if(hash) {
				displayCoursePage(hash.substr(1));
				event.preventDefault();
				event.stopImmediatePropagation();
			}
		});

	});

});