define(function (require) {

	var PROMOTIONS = ["B1", "B2", "B3", "M1", "M2"];
	var ORGANIZATION = "CodeCourses";

	var Mustache = require("lib/mustache");
	var GitHub = require("github_adapter").GitHubAdapter;

	$(document).ready( function() {

		function showLoading() {
			$.mobile.showPageLoadingMsg();
		}

		function hideLoading() {
			$.mobile.hidePageLoadingMsg()
		}

		function displayPromotions(promotions, callback) {
			$.get('templates/promotion.mustache', function(template) {
				promotions.forEach( function(promotion, index) {
					displayPromotion(promotion, index + 1, template);
				});
				if(callback) callback();
			});
		}

		function displayPromotion(promotion, year, template) {
			var html = Mustache.to_html(template, { 
				name: promotion,
				year: year
			});
			$("#main-page-content").append(html);
		}

		function displayCourses(courses, callback) {
			$.get('templates/course.mustache', function(template) {
				courses.forEach( function(course) {
					var courseCode = course.courseCode;
					var courseYear = parseInt(courseCode.charAt(0));
					if(isValidCourse(courseYear)) {
						displayCourse(courseYear, course, template);
					} else {
						console.log(course.name + " is not a valid course repository.");
					}
				});
				if(callback) callback();
			});
		}

		function displayCourse(courseYear, course, template) {
			var html = Mustache.to_html(template, course);
			$("#promotion_" + courseYear + " .courses").append(html);
		}

		function displayCourseFiles(courseCode, files, callback) {
			$.get('templates/course_file.mustache', function(template) {
				files.forEach( function(file) {
					displayCourseFile(courseCode, file, template);
				});
				if(callback) callback();
			});
		}

		function displayCourseFile(courseCode, file, template) {
			var html = Mustache.to_html(template, file);
			$("#course-page .course_files").append(html);
		}

		function isValidCourse(courseYear) {
			return typeof courseYear === "number" && courseYear > 0 && courseYear < PROMOTIONS.length;
		}

		function displayCoursePage(courseCode) {
			showLoading();
			$.mobile.changePage("#course-page", { changeHash: false });
			GitHub.getRepository(ORGANIZATION, courseCode, function(repository) {
				$("#course-page > header > h1 > span.courseCode").text(repository.courseCode);
				$("#course-page a.repository").attr("href", repository.htmlRepositoryUrl);
				$("#course-page .course_files").html("");
				GitHub.getRepositoryFiles(ORGANIZATION, repository.courseCode, function(files) {
					displayCourseFiles(repository.courseCode, files, function() {
						$('#course-page .course_files').listview('refresh');
						hideLoading();
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
				showLoading();
				displayCoursePage(hash.substr(1));
				event.preventDefault();
				event.stopImmediatePropagation();
			}
		});

		showLoading();

		displayPromotions(PROMOTIONS, function() {
			GitHub.getOrganizationRepositories(ORGANIZATION, function(repositories) {
				displayCourses(repositories, function() {
					$("#main-page").page("destroy").page();
					hideLoading();
				});
			});
		});

	});

});