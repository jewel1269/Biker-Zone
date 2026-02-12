import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaCrown,
  FaUserCircle,
  FaLaptopCode,
  FaFileImport,
} from "react-icons/fa";
import {
  MdDashboardCustomize,
  MdOutlineQuiz,
  MdLeaderboard,
  MdLogout,
} from "react-icons/md";
import { PiPathBold } from "react-icons/pi";
import { VscSignIn } from "react-icons/vsc";
import "./NavBar.css";
import { toast } from "react-hot-toast";
import { Helmet } from "react-helmet";
import logo from "/bina-logo-light.svg";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import CatalogMegaMenu from "./CatalogMegaMenu";
import ThemeToggle from "../../../components/ThemeToggle/ThemeToggle";
import LanguageSelector from "../../../components/LanguageSwitcher/LanguageSwitcher";
import { useTranslation } from "react-i18next";

import { useMe } from "../../../hooks/users/useMe";
import { useLogout } from "../../../hooks/users/useLogout";
import { useCatalogCourses } from "../../../hooks/courses/useCatalogCourses";
import { useCourse } from "../../../hooks/courses/useCourse";
import { TOUR_TARGETS } from "../../constants/onboardingTargets";

const NAV_HIDE_SCROLL_THRESHOLD = 50;
const ASSESSMENT_CATEGORIES = new Set([
  "coding",
  "cyber",
  "general",
  "security",
  "networking",
]);
const PLAYGROUND_DROPDOWN_CATEGORIES = new Set(["coding", "cyber"]);

const NavBar = () => {
  const { t, i18n } = useTranslation("layout");

  const isRTL = i18n.dir() === "rtl";

  // Redux (theme + course flags)
  const theme = useSelector((state) => state.theme.theme);

  // Custom hooks
  const { user } = useMe();
  const { course } = useCourse({ id: user?.course });

  const { logout, isPending: isLoggingOut } = useLogout();
  const { catalogCourses, isLoading: catalogCoursesLoading } =
    useCatalogCourses();

  // Local state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userClicked, setUserClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [catalogMenuOpen, setCatalogMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const catalogRef = useRef(null);
  const lastScrollPosRef = useRef(0);
  const from = location.state?.from?.pathname ?? "/";

  const dropDownIcons = useMemo(
    () => ({
      dashboard: <MdDashboardCustomize />,
      playGround: <FaLaptopCode />,
      exams: <MdOutlineQuiz />,
      leaderBoard: <MdLeaderboard />,
      submissions: <FaFileImport />,
      createLearningPath: <PiPathBold />,
      logOut: <MdLogout />,
    }),
    []
  );

  const hasAccess =
    (user?.role === "expert" && course?.creators?.includes(user?._id)) ||
    user?.role === "admin";

  const showCatalog = Boolean(course?.enablePathChange || hasAccess);
  const showAssessmentRoutes = ASSESSMENT_CATEGORIES.has(course?.category);
  const showProjects = Boolean(showAssessmentRoutes && course?.showProjects);
  const showAIChat = Boolean(
    course?.showPlayground &&
      (course?.category === "ai" || course?.category === "general")
  );
  const showPlayground = Boolean(course?.showPlayground && !showAIChat);
  const showMyPlaygroundInProfile = Boolean(
    PLAYGROUND_DROPDOWN_CATEGORIES.has(course?.category) &&
      course?.showPlayground
  );

  // Toggle the menu's open state
  const handleMenuToggle = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setCatalogMenuOpen(false);
  };

  const isActiveRoute = (routePath, { exact = false } = {}) => {
    if (routePath === "/") {
      return location.pathname === "/";
    }
    if (exact) {
      return location.pathname === routePath;
    }
    return (
      location.pathname === routePath ||
      location.pathname.startsWith(`${routePath}/`)
    );
  };

  const mainLinks = useMemo(
    () => [
      {
        to: "/",
        label: t("header.nav.home"),
        tourClassName: TOUR_TARGETS.WELCOME_SECTION,
        exact: true,
      },
      {
        to: "/learning-path/languages",
        label: t("header.nav.learningPath"),
        tourClassName: TOUR_TARGETS.ACTION_BUTTON,
      },
    ],
    [t]
  );

  const aboutLinks = useMemo(
    () => [
      { to: "#trustedby", label: t("header.nav.about.trustedBy") },
      { to: "#statistics", label: t("header.nav.about.statistics") },
      { to: "#usecases", label: t("header.nav.about.useCases") },
    ],
    [t]
  );

  const profileMenuLinks = useMemo(() => {
    const links = [
      {
        to: "/dashboard",
        label: t("header.profileMenu.dashboard"),
        icon: dropDownIcons.dashboard,
      },
    ];

    if (showMyPlaygroundInProfile) {
      links.push({
        to: "/my-playground",
        label: t("header.profileMenu.myPlayground"),
        icon: dropDownIcons.playGround,
      });
    }

    links.push({
      to: "/my-exams",
      label: t("header.profileMenu.myExams"),
      icon: dropDownIcons.exams,
    });

    if (course?.showLeaderboard) {
      links.push({
        to: "/leader-board",
        label: t("header.profileMenu.leaderboard"),
        icon: dropDownIcons.leaderBoard,
      });
    }

    if (course?.showSubmissions) {
      links.push({
        to: "/submissions",
        label: t("header.profileMenu.submissions"),
        icon: dropDownIcons.submissions,
      });
    }

    if (user?.role !== "user") {
      links.push({
        to: "/create-learning-path",
        label: t("header.profileMenu.createLearningPath"),
        icon: dropDownIcons.createLearningPath,
      });
    }

    return links;
  }, [course, dropDownIcons, showMyPlaygroundInProfile, t, user?.role]);

  // Handle the logout procedure (via custom hook)
  const handleSignOut = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success(t("header.toast.logoutSuccess"));
        navigate(from, { replace: true });
      },
      onError: () => {
        navigate("/", { replace: true });
      },
    });
  };

  const handleUserClick = () => setUserClicked((prev) => !prev);

  // Toggle catalog menu with keyboard accessibility
  const handleCatalogToggle = (event) => {
    if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ")
      return;
    event.preventDefault();
    setCatalogMenuOpen((prev) => !prev);
  };

  const getTopLinkClassName = (to, tourClassName, exact) =>
    `pb-1 text-default transition duration-500 ease-in hover:text-muted ${
      tourClassName ?? ""
    } ${isRTL ? "nav-effect-rtl" : "nav-effect"} ${
      isActiveRoute(to, { exact })
        ? "border-b-2 border-primary-dark font-medium"
        : ""
    }`;

  const DropdownLink = ({ to, icon, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-4 py-2 text-default hover:bg-primary-dark hover:bg-opacity-30 hover:text-secondary-dark ${
        isRTL ? "flex-row-reverse text-right" : ""
      }`}
    >
      <span className={`flex ${isRTL ? "ml-2" : "mr-2"}`}>{icon}</span>
      {children}
    </Link>
  );

  // Close dropdowns on outside click / ESC
  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setUserClicked(false);
      }

      if (catalogRef.current && !catalogRef.current.contains(event.target)) {
        setCatalogMenuOpen(false);
      }
    };

    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setUserClicked(false);
        setCatalogMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutsideDropdown);
    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("click", handleClickOutsideDropdown);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  // Hide/show navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;

      if (
        currentScrollPos > lastScrollPosRef.current &&
        currentScrollPos > NAV_HIDE_SCROLL_THRESHOLD
      ) {
        setIsVisible(false);
        setCatalogMenuOpen(false);
      } else {
        setIsVisible(true);
      }

      lastScrollPosRef.current = currentScrollPos;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`top-0 z-20 w-full backdrop-blur ${
        location.pathname === "/" || location.pathname === "/about"
          ? "fixed"
          : "sticky"
      }`}
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Helmet>
        <title>{t("header.helmet.title")}</title>
        <link rel="icon" href={logo} />
      </Helmet>

      <div
        className={`mx-auto w-full max-w-[1280px] items-center justify-between bg-inherit px-3 py-2 ${
          user?.role === "hr" ? "flex" : "lg:flex"
        }`}
      >
        {/* Brand + Mobile Menu Toggle */}
        <div
          className={`flex items-center justify-between ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <Link to="/" className="text-xl font-semibold text-default">
            <div className="flex items-center gap-1">
              <img
                className="h-10 lg:h-14"
                src={
                  theme === "dark"
                    ? "/bina-logo-dark.svg"
                    : "/bina-logo-light.svg"
                }
                alt="logo"
              />
            </div>
          </Link>

          {user?.role !== "hr" && (
            <div className="lg:hidden">
              <button
                type="button"
                onClick={handleMenuToggle}
                className="p-2 text-default transition-opacity duration-300 ease-in-out focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
                style={{ opacity: isMenuOpen ? 0.5 : 1 }}
              >
                {isMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Default (non-HR) Menu */}
        {user?.role === "hr" ? (
          // HR menu (simplified)
          <div className="flex items-center">
            <ul
              className={`flex items-center gap-4 lg:text-left xl:gap-5 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <li>
                <ThemeToggle />
              </li>
              <li>
                <LanguageSelector />
              </li>
              <li className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={handleUserClick}
                  className={`flex items-center ${
                    userClicked ? "text-muted" : "text-default"
                  }`}
                  aria-expanded={userClicked}
                  aria-haspopup="true"
                >
                  {user?.photo ? (
                    <img
                      className="h-9 w-9 rounded-full border-2 border-primary-dark object-cover p-1"
                      title={user?.firstName}
                      src={user?.photo}
                      alt={user?.firstName}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <FaUserCircle
                      className="h-9 w-9 rounded-full border-2 border-primary-dark p-1"
                      title={user?.firstName}
                    />
                  )}
                </button>

                <div
                  className={`cleancode-dropdown-animation absolute ${
                    isRTL ? "left-0" : "right-0"
                  } z-10 mt-2 ${userClicked ? "block" : "hidden"}`}
                >
                  <div className="overflow-hidden rounded-md border border-grey-dark bg-secondary py-2 shadow-xl transition-all duration-300 hover:border-primary-dark">
                    <div className="px-4 py-2">
                      <div
                        className={`flex items-center gap-2 ${
                          isRTL ? "flex-row-reverse text-right" : ""
                        }`}
                      >
                        <div className="h-9 w-9 shrink-0">
                          {user?.photo ? (
                            <img
                              className="h-9 w-9 rounded-full border-2 border-primary p-1"
                              src={user?.photo}
                              alt={user?.firstName}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <FaUserCircle className="h-9 w-9 rounded-full border-2 border-primary-dark p-1" />
                          )}
                        </div>

                        <div className={isRTL ? "text-right" : ""}>
                          <p className="font-medium text-default">
                            {user?.firstName}
                          </p>
                          <p className="dark:text-dark-label-3 w-[15rem] overflow-hidden text-xs italic text-primary-dark">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="z-200 border-t border-primary">
                      <DropdownLink
                        to="/dashboard"
                        icon={dropDownIcons.dashboard}
                        onClick={() => setUserClicked(false)}
                      >
                        {t("header.profileMenu.dashboard")}
                      </DropdownLink>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={isLoggingOut}
                        className={`mb-4 flex w-full items-center px-4 py-2 text-left text-default hover:bg-primary-dark hover:bg-opacity-30 hover:text-secondary-dark ${
                          isRTL ? "flex-row-reverse text-right" : ""
                        } ${isLoggingOut ? "opacity-60" : ""}`}
                      >
                        <span className={`flex ${isRTL ? "ml-2" : "mr-2"}`}>
                          {dropDownIcons.logOut}
                        </span>
                        {t("header.profileMenu.logout")}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex items-center">
            <div
              className={`${
                isMenuOpen ? "block" : "hidden"
              } cleancode-menu-animation mt-4 transition-all duration-300 lg:mt-0 lg:flex lg:w-auto`}
              id="mobile-menu"
            >
              {/* Left links */}
              <ul
                className={`mr-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4 lg:text-left xl:gap-5 ${
                  isRTL ? "lg:flex-row-reverse" : ""
                }`}
              >
                {location.pathname.includes("about")
                  ? aboutLinks.map((link) => (
                      <li key={link.to}>
                        <a
                          href={link.to}
                          onClick={closeMenu}
                          className={`pb-1 text-default transition duration-500 ease-in hover:text-muted ${
                            isRTL ? "nav-effect-rtl" : "nav-effect"
                          }`}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))
                  : mainLinks.map((link) => (
                      <li key={link.to}>
                        <Link
                          to={link.to}
                          onClick={closeMenu}
                          className={getTopLinkClassName(
                            link.to,
                            link.tourClassName,
                            link.exact
                          )}
                          aria-current={
                            isActiveRoute(link.to, { exact: link.exact })
                              ? "page"
                              : undefined
                          }
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}

                {/* Catalog */}
                {showCatalog && (
                  <li ref={catalogRef}>
                    <button
                      type="button"
                      className={`${TOUR_TARGETS.SEARCH_BAR} flex items-center gap-2 text-default transition duration-500 ease-in hover:text-muted ${
                        location.pathname.includes("/catalog")
                          ? "border-b-2 border-b-primary-dark pb-[1.5px] font-medium"
                          : ""
                      } ${isRTL ? "flex-row-reverse" : ""}`}
                      onClick={handleCatalogToggle}
                      onKeyDown={handleCatalogToggle}
                      tabIndex={0}
                      aria-expanded={catalogMenuOpen}
                      aria-haspopup="true"
                      aria-controls="catalog-menu"
                    >
                      {t("header.nav.catalog")}
                      {catalogCoursesLoading && (
                        <span
                          className={`${isRTL ? "mr-1" : "ml-1"} flex h-2 w-2 items-center justify-center`}
                        >
                          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
                        </span>
                      )}
                      <svg
                        className={`${isRTL ? "mr-1" : "ml-1"} h-4 w-4 transition-transform ${
                          catalogMenuOpen ? "rotate-180" : ""
                        } ${isRTL ? "scale-x-[-1]" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    <CatalogMegaMenu
                      isOpen={catalogMenuOpen}
                      onClose={() => setCatalogMenuOpen(false)}
                      courses={catalogCourses}
                      isLoading={catalogCoursesLoading}
                      triggerRef={catalogRef}
                    />
                  </li>
                )}

                {/* Exams / Quizzes / Projects */}
                {showAssessmentRoutes && (
                  <>
                    <li>
                      <Link
                        to="/exams"
                        onClick={closeMenu}
                        className={getTopLinkClassName("/exams")}
                        aria-current={
                          isActiveRoute("/exams") ? "page" : undefined
                        }
                      >
                        {t("header.nav.exams")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/quizzes"
                        onClick={closeMenu}
                        className={getTopLinkClassName("/quizzes")}
                        aria-current={
                          isActiveRoute("/quizzes") ? "page" : undefined
                        }
                      >
                        {t("header.nav.quizzes")}
                      </Link>
                    </li>

                    {showProjects && (
                      <li>
                        <Link
                          to="/projects"
                          onClick={closeMenu}
                          className={getTopLinkClassName("/projects")}
                          aria-current={
                            isActiveRoute("/projects") ? "page" : undefined
                          }
                        >
                          {t("header.nav.projects")}
                        </Link>
                      </li>
                    )}
                  </>
                )}

                {/* Playground / AI Chat */}
                {showAIChat && (
                  <li>
                    <Link
                      to="/chat"
                      onClick={closeMenu}
                      className={getTopLinkClassName("/chat")}
                      aria-current={isActiveRoute("/chat") ? "page" : undefined}
                    >
                      {t("header.nav.aiChat")}
                    </Link>
                  </li>
                )}

                {showPlayground && (
                  <li>
                    <Link
                      to="/playground"
                      onClick={closeMenu}
                      className={getTopLinkClassName("/playground")}
                      aria-current={
                        isActiveRoute("/playground") ? "page" : undefined
                      }
                    >
                      {t("header.nav.playground")}
                    </Link>
                  </li>
                )}
              </ul>

              {/* Right controls */}
              <ul
                className={`mt-4 flex flex-col gap-3 md:mt-0 lg:flex-row lg:items-center lg:gap-4 lg:text-left xl:gap-5 ${
                  isRTL ? "lg:flex-row-reverse" : ""
                }`}
              >
                {user?.role === "admin" && (
                  <li>
                    <ThemeToggle />
                  </li>
                )}

                {(!user?.isPremium || location.pathname.includes("about")) && (
                  <li>
                    <Link
                      to="/checkout"
                      onClick={closeMenu}
                      className="pb-1 text-default"
                    >
                      <button
                        type="button"
                        className={`flex items-center gap-1.5 rounded-lg border border-primary-dark px-3 py-1.5 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <FaCrown className="text-primary-dark" />
                        {t("header.nav.upgrade")}
                      </button>
                    </Link>
                  </li>
                )}

                <li>
                  <LanguageSelector />
                </li>

                {/* Profile / Auth */}
                {user?._id ? (
                  <li
                    className="absolute right-14 top-3 lg:relative lg:right-auto lg:top-auto"
                    ref={profileMenuRef}
                  >
                    <button
                      type="button"
                      onClick={handleUserClick}
                      className={`flex items-center ${
                        userClicked ? "text-muted" : "text-default"
                      }`}
                      aria-expanded={userClicked}
                      aria-haspopup="true"
                    >
                      {user?.photo ? (
                        <img
                          className="h-9 w-9 rounded-full border-2 border-primary object-cover p-1"
                          title={user?.firstName}
                          src={user?.photo}
                          alt={user?.firstName}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <FaUserCircle
                          className="h-9 w-9 rounded-full border-2 border-primary-dark p-1"
                          title={user?.firstName}
                        />
                      )}
                    </button>

                    <div
                      className={`cleancode-dropdown-animation absolute -right-8 z-10 mt-2 lg:right-0 ${
                        userClicked ? "block" : "hidden"
                      }`}
                    >
                      <div className="overflow-hidden rounded-md border border-grey-dark bg-secondary py-2 shadow-xl transition-all duration-300 hover:border-primary-dark">
                        <div className="px-4 py-2">
                          <div
                            className={`flex items-center gap-2 ${
                              isRTL ? "flex-row-reverse text-right" : ""
                            }`}
                          >
                            <div className="h-9 w-9 shrink-0">
                              {user?.photo ? (
                                <img
                                  className="h-9 w-9 rounded-full border-2 border-primary-dark p-1"
                                  src={user?.photo}
                                  alt={user?.firstName}
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <FaUserCircle className="h-9 w-9 rounded-full border-2 border-primary-dark p-1" />
                              )}
                            </div>

                            <div className={isRTL ? "text-right" : ""}>
                              <p className="font-medium text-default">
                                {user?.firstName}
                              </p>
                              <p className="dark:text-dark-label-3 w-[15rem] overflow-hidden text-xs italic text-primary-dark">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="z-200 border-t border-primary">
                          {profileMenuLinks.map((item) => (
                            <DropdownLink
                              key={item.to}
                              to={item.to}
                              icon={item.icon}
                              onClick={() => {
                                setUserClicked(false);
                                closeMenu();
                              }}
                            >
                              {item.label}
                            </DropdownLink>
                          ))}

                          <button
                            type="button"
                            onClick={handleSignOut}
                            disabled={isLoggingOut}
                            className={`mb-4 flex w-full items-center px-4 py-2 text-left text-default hover:bg-primary-dark hover:bg-opacity-30 hover:text-secondary-dark ${
                              isRTL ? "flex-row-reverse text-right" : ""
                            } ${isLoggingOut ? "opacity-60" : ""}`}
                          >
                            <span className={`${isRTL ? "ml-2" : "mr-2"}`}>
                              {dropDownIcons.logOut}
                            </span>
                            {t("header.profileMenu.logout")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ) : (
                  <li
                    className="tour-profile absolute right-14 top-3 lg:relative lg:right-auto lg:top-auto"
                    ref={profileMenuRef}
                  >
                    <button
                      type="button"
                      onClick={handleUserClick}
                      className={`flex items-center ${
                        userClicked ? "text-muted" : "text-default"
                      }`}
                      aria-expanded={userClicked}
                      aria-haspopup="true"
                    >
                      <VscSignIn
                        className={`h-8 w-8 rounded-full p-1 ${
                          userClicked ? "border-2 border-primary" : ""
                        }`}
                        title="User"
                      />
                    </button>

                    <div
                      className={`cleancode-dropdown-animation absolute ${
                        isRTL ? "left-0 lg:-left-8" : "-right-8 lg:right-0"
                      } z-10 mt-2 ${userClicked ? "block" : "hidden"}`}
                    >
                      <div className="w-[10rem] overflow-hidden rounded-md border border-grey-dark bg-secondary py-2 shadow-xl transition duration-300 ease-in hover:border-primary-dark">
                        <div>
                          <DropdownLink
                            to="/login"
                            icon={<VscSignIn />}
                            onClick={() => setUserClicked(false)}
                          >
                            {t("header.nav.signin")}
                          </DropdownLink>
                          <DropdownLink
                            to="/signup"
                            icon={<FaUserCircle />}
                            onClick={() => setUserClicked(false)}
                          >
                            {t("header.nav.register")}
                          </DropdownLink>
                        </div>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default NavBar;
