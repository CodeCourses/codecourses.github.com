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
				$("#main-page .course_files").listview("refresh");
			});
		}

		function displayCourseFile(courseCode, file, template) {
			var html = Mustache.to_html(template, file);
			$("#main-page .course_files").append(html);
		}

		function isValidCourse(courseYear) {
			return typeof courseYear === "number" && courseYear > 0 && courseYear < PROMOTIONS.length;
		}

		function displayCoursePage(courseCode) {
			showLoading();
			GitHub.getRepository(ORGANIZATION, courseCode, function(repository) {
				$("#main-page > header > h1 > span.courseCode").text(repository.courseCode);
				$("#main-page a.repository").attr("href", repository.htmlRepositoryUrl);
				$("#main-page .course_files").html("");
				GitHub.getRepositoryFiles(ORGANIZATION, repository.courseCode, function(files) {
					displayCourseFiles(repository.courseCode, files, function() {
						/*$.mobile.changePage("#main-page", { changeHash: false });
						$('#main-page .course_files').listview('refresh');*/
						hideLoading();
						if(isSmartphone()) { $("nav").hide(); }
						$("#course-page-content > div").show();
						$("#course-page-content > div").attr("id", courseCode);
					});
				});
			});
		}
		
		function isSmartphone() {
			return (/iPhone|iPod|Android|opera mini|blackberry|palm os|palm|hiptop|avantgo|plucker|xiino|blazer|elaine|iris|3g_t|windows ce|opera mobi|windows ce; smartphone;|windows ce;iemobile/i.test(navigator.userAgent));
		}

		$("#main-page").bind("pagebeforecreate", function(event) {
			var hash = window.location.hash;
			if(hash) {
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

		$(document).on("click", "li[id^='course_'] a", function(event) {
			var hash = $(this).attr("href");
			window.location.hash = hash;
			var courseCode = hash.substr(1);
			displayCoursePage(courseCode);
			$("li[id^='course_'] a").removeClass("selected");
			$(this).addClass("selected");
			event.preventDefault();
		});

	});

});