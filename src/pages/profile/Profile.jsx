import React, { useState } from "react";
import { confirmAlert } from "react-confirm-alert";
import DashboardLayout from "../../component/DashboardLayout";
import SEOHead from "../../components/SEOHead";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Modal,
  Form,
  Badge,
  Spinner,
  Image,
} from "react-bootstrap";
import { formatDistanceToNow } from "date-fns";
import Tabs from "../../component/Tabs";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateUser } from "../../store/userSlice";
import { useNavigate, useParams } from "react-router-dom";
import "../../scss/profile.scss";
import "../../scss/feed.scss"; // Import feed styles for post cards
import {
  useGetProfile,
  useGetUserProfile,
  useEditProfile,
  useListClasses,
  useGetEducationalInstitutions,
} from "../../hooks/index";
import { useGetPendingRequests } from "../../hooks/useRQUserFollowing";
import { useGetUserPosts, useDeletePost } from "../../hooks/useRQPost";
import { useQueryClient } from "@tanstack/react-query";
import { Dropdown } from "react-bootstrap";
import FollowButton from "../../components/FollowButton";
import PrivateProfileMessage from "../../components/PrivateProfileMessage";
import LikeButton from "../../components/LikeButton";
import CommentSection from "../../components/CommentSection";
import ProfilePhotoModal from "../../components/ProfilePhotoModal";
import { useListClubs, useListCategories } from "../../hooks/useRQClub";
import { useFormik } from "formik";
import ClassesGrid from "./ClassesGrid";
import TNInput from "../../component/TNInput";
import ProfilePhotoCropper from "./ProfilePhotoCropper";
import * as Yup from "yup";
import { toast } from "react-toastify";

// Helper function to safely format date
const formatPostDate = (dateString) => {
  if (!dateString) return "Recently";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return "Recently";
  }
};

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userStore = useSelector((s) => s.user?.user);
  const { userId } = useParams(); // Get userId from URL params (if viewing another user's profile)

  // Determine if viewing own profile or another user's
  const isOwnProfile = !userId || userId === userStore?.id;

  // Fetch own profile data (for logged-in user)
  const {
    isLoading: isOwnProfileLoading,
    data: ownProfileData,
    refetch: refetchOwnProfile,
  } = useGetProfile();
  const ownProfile =
    (ownProfileData && (ownProfileData.data || ownProfileData)) || null;

  // Fetch other user's profile data (if viewing someone else)
  const { data: otherUserProfileData, isLoading: isOtherProfileLoading } =
    useGetUserProfile(userId, undefined, undefined);

  // Update Redux store when own profile data is fetched
  React.useEffect(() => {
    if (ownProfile && isOwnProfile) {
      dispatch(updateUser(ownProfile));
    }
  }, [ownProfile, dispatch, isOwnProfile]);

  React.useEffect(() => {
    import("aos").then((AOS) => {
      AOS.init({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
      });
    });
    import("aos/dist/aos.css");
  }, []);

  // Extract profile data based on which profile is being viewed
  const profileData = isOwnProfile ? ownProfile : otherUserProfileData?.data;
  const profile = isOwnProfile ? ownProfile : profileData?.user;
  const permission = !isOwnProfile ? profileData?.permission : null;
  const myFollowStatus = !isOwnProfile ? profileData?.my_follow_status : null;
  const isProfileLoading = isOwnProfile
    ? isOwnProfileLoading
    : isOtherProfileLoading;
  const refetch = isOwnProfile ? refetchOwnProfile : undefined;

  // Fetch user posts (only if can view posts)
  const canViewPosts = isOwnProfile || permission?.canViewPosts;
  const { data: postsResponse, isLoading: isPostsLoading } = useGetUserPosts(
    isOwnProfile ? userStore?.id : userId,
    canViewPosts,
    undefined,
    undefined,
  );
  const userPosts = postsResponse?.data?.posts || [];

  // Classes list
  const { data: classesResp, isLoading: isClassesLoading } = useListClasses();
  // Handle API response structure: { data: { classes: [...], ... } } or { classes: [...] }
  const classes = Array.isArray(classesResp?.data?.classes)
    ? classesResp.data.classes
    : Array.isArray(classesResp?.classes)
    ? classesResp.classes
    : Array.isArray(classesResp?.data)
    ? classesResp.data
    : Array.isArray(classesResp)
    ? classesResp
    : [];
  const { data: educationalInstitutionsRes } = useGetEducationalInstitutions();

  const educationalInstitutionsOptions = React.useMemo(() => {
    return (
      educationalInstitutionsRes?.data?.map((u) => ({
        value: u.id,
        label: u.name,
      })) || []
    );
  }, [educationalInstitutionsRes]);

  // Get university name from ID
  const universityName = React.useMemo(() => {
    if (!profile?.educational_institution_id) return "";
    const educationalInstitution = educationalInstitutionsOptions.find(
      (u) => u.value === profile.educational_institution_id,
    );
    return educationalInstitution?.label || "";
  }, [profile?.educational_institution_id, educationalInstitutionsOptions]);

  // Map academic year value to display label
  const academicYearLabel = React.useMemo(() => {
    if (!profile?.academic_year) return "";
    const yearMap = {
      1: "1st Year",
      2: "2nd Year",
      3: "3rd Year",
      4: "4th Year",
      5: "Freshman",
      6: "Sophomore",
      7: "Junior",
      8: "Senior",
      9: "Graduate",
    };
    return yearMap[profile.academic_year] || profile.academic_year;
  }, [profile?.academic_year]);

  // Clubs list for profile tab
  const { data: clubsRes, isLoading: isClubsLoading } = useListClubs();
  const { data: catRes } = useListCategories();
  const categoriesMap = React.useMemo(() => {
    const arr = Array.isArray(catRes?.data) ? catRes.data : [];
    const map = new Map();
    arr.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [catRes]);
  const clubsData = clubsRes?.data;
  const ownedClubs = Array.isArray(clubsData)
    ? []
    : Array.isArray(clubsData?.myClubs)
      ? clubsData.myClubs
      : [];
  const allOther = Array.isArray(clubsData)
    ? clubsData
    : Array.isArray(clubsData?.otherClubs)
      ? clubsData.otherClubs
      : [];
  const joinedOrFollowing = allOther.filter((c) => {
    const reqs = Array.isArray(c.requests) ? c.requests : [];
    return reqs.some((r) => r.status === "approved" || r.is_following);
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("profile");
  const [pageTab, setPageTab] = useState("posts");

  React.useEffect(() => {
    import("aos").then((AOS) => {
      AOS.refresh();
    });
  }, [pageTab]);

  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const fileInputRef = React.useRef(null);

  // Fetch pending follow requests (only for own profile)
  const { data: pendingRequestsData } = useGetPendingRequests(
    isOwnProfile ? {} : null,
  );
  const pendingRequestsCount = pendingRequestsData?.data?.length || 0;

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Delete post mutation
  const { mutate: deletePost, isPending: isDeletingPost } = useDeletePost();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      full_name: profile?.full_name || "",
      username: profile?.username || "",
      birthday: profile?.birthday || "",
      phone_number: profile?.phone_number || "",
      city: "",
      bio: "",
      educational_institution_id: profile?.educational_institution_id || "",
      major: profile?.major || "",
      academic_year: profile?.academic_year || "",
      grade_display_format: profile?.grade_display_format || "percentage",
      account_privacy: Boolean(profile?.account_privacy) || false,
      email: profile?.email || "",
      profile_image: profile?.profile_image || "",
    },
    validationSchema: Yup.object({
      full_name: Yup.string().trim().required("Display name is required"),
      username: Yup.string().required("Username is required"),
      birthday: Yup.string()
        .nullable()
        .test("valid-past-date", "Birthday must be in the past", (value) => {
          if (!value) return true;
          const birthday = new Date(value);
          const today = new Date();
          return birthday < today;
        })
        .test("min-age", "You must be at least 13 years old", (value) => {
          if (!value) return true;
          const birthday = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthday.getFullYear();
          const monthDiff = today.getMonth() - birthday.getMonth();
          const dayDiff = today.getDate() - birthday.getDate();
          const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
          return actualAge >= 13;
        }),
      phone_number: Yup.string()
        .matches(/^[0-9+\-()\s]*$/, "Invalid phone number")
        .max(20, "Phone number is too long")
        .nullable(),
      educational_institution_id: Yup.string().nullable(),
      major: Yup.string().nullable(),
      academic_year: Yup.string().nullable(),
      grade_display_format: Yup.mixed()
        .oneOf(["percentage", "gpa", "letter_grade"])
        .required("Grade display format is required"),
      account_privacy: Yup.boolean(),
      email: Yup.string().email("Invalid email").required("Email is required"),
    }),
    onSubmit: (values) => {
      const payload = {
        full_name: values.full_name,
        username: values.username,
        birthday: values.birthday || null,
        phone_number: values.phone_number || null,
        educational_institution_id: values.educational_institution_id || null,
        academic_year: values.academic_year || null,
        major: values.major || null,
        account_privacy: values.account_privacy ? 1 : 0,
        grade_display_format: values.grade_display_format,
        city: values.city || null,
        bio: values.bio || null,
        profile_image: values.profile_image || null,
      };

      editProfile(payload, {
        onSuccess: (res) => {
          refetch();
          setSettingsOpen(false);
        },
      });
    },
  });

  const { mutate: editProfile, isPending: isEditPending } = useEditProfile();

  const onSignOut = () => {
    dispatch(logout());
    setSettingsOpen(false);
    navigate("/login");
  };

  const handleDeletePost = (postId) => {
    confirmAlert({
      closeOnClickOutside: false,
      overlayClassName: "react-confirm-alert-overlay",
      customUI: ({ onClose }) => (
        <div className="cc-confirm card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-2">Delete Post</h5>
            <p className="mb-4">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  deletePost(postId, {
                    onSuccess: (res) => {
                      queryClient.invalidateQueries([
                        "user-posts",
                        isOwnProfile ? userStore?.id : userId,
                      ]);
                      queryClient.invalidateQueries(["feed"]);
                      setOpenDropdownId(null);
                    },
                    onError: (err) => {
                      toast.error(
                        err?.response?.data?.message || "Failed to delete post"
                      );
                    },
                  });
                  onClose();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  const onChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropSrc(String(ev.target?.result || ""));
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    // reset input so selecting same file again fires change
    e.target.value = "";
  };

  const onCropCancel = () => {
    setCropperOpen(false);
    setCropSrc("");
  };

  const onCropSave = (dataUrl) => {
    setCropperOpen(false);
    setCropSrc("");

    // Convert base64 data URL to Blob
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });

    // Create FormData and append the blob as a file
    const formData = new FormData();
    formData.append("profile_image", blob, "profile-image.png");

    // Save to server as profile_image
    editProfile(formData, {
      onSuccess: (res) => {
        refetch();
      },
    });
  };

  const currentProfileData = isOwnProfile ? ownProfile : profileData?.user || profileData;
  const userName = currentProfileData?.name || "User";
  const userBio = currentProfileData?.bio || `${userName}'s profile on CampusClip`;
  const userProfileMetadata = {
    title: `${userName}`,
    description: userBio.substring(0, 150),
    keywords: `${userName}, student profile, campus network`,
    canonical: isOwnProfile ? "/profile" : `/profile/${userId}`,
    ogType: "profile",
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": userName,
    "url": `https://campusclip.com${userProfileMetadata.canonical}`,
    "image": currentProfileData?.profile_pic_url || "https://campusclip.com/og-image.png",
  };

  return (
    <>
      <SEOHead {...userProfileMetadata} jsonLd={personSchema} />
      <DashboardLayout>
      <div className="profile-main">
        {/* Profile Card */}
        <div className="profile-card" data-aos="fade-right">
          <div className="profile-top d-flex align-items-center">
            <div
              className="avatar-lg clickable"
              onClick={() => setShowPhotoModal(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setShowPhotoModal(true)}
            >
              {profile?.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt="avatar"
                />
              ) : (
                (profile?.full_name || userStore?.name || "U").charAt(0)
              )}
            </div>
            <div className="profile-name">
              <h4>{profile ? profile.full_name : userStore?.name || "User"}</h4>
              <p>
                {profile?.username
                  ? `@${profile.username}`
                  : userStore?.username || "@username"}
              </p>
            </div>
          </div>
          <div className="d-flex justify-content-center profile-meta-main">
            <div className="profile-meta">
              <b>{profile?.posts_count || 0}</b> posts
            </div>
            <div
              className="profile-meta"
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(
                  isOwnProfile
                    ? "/profile/followers"
                    : `/profile/${userId}/followers`,
                )
              }
            >
              <b>{profile?.followers_count || 0}</b> followers
            </div>
            <div
              className="profile-meta"
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(
                  isOwnProfile
                    ? "/profile/following"
                    : `/profile/${userId}/following`,
                )
              }
            >
              <b>{profile?.following_count || 0}</b> following
            </div>
          </div>
          <div className="d-flex justify-content-center flex-wrap text-center profile-details">
            <span>
              <b>{academicYearLabel}</b>
            </span>
            {profile?.major && academicYearLabel && <span>•</span>}
            <span>{profile?.major || ""}</span>
          </div>
          <div className="d-flex justify-content-center profile-details">
            {universityName || ""}
          </div>
          <div className="d-flex justify-content-center gap-2 mt-3">
            {isOwnProfile ? (
              <>
                <Button
                  className="btn btn-second"
                  onClick={() => {
                    setSettingsTab("profile");
                    setSettingsOpen(true);
                  }}
                >
                  Edit Profile
                </Button>
                <Button
                  onClick={() => navigate("/follow-requests")}
                  className="btn btn-second"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="me-1"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  {pendingRequestsCount > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: "0.65rem" }}
                    >
                      {pendingRequestsCount}
                    </Badge>
                  )}
                </Button>
              </>
            ) : (
              <FollowButton
                userId={userId}
                followStatus={myFollowStatus}
                isPrivate={profile?.account_privacy === 1}
              />
            )}
          </div>
        </div>

        {/* Page Tabs below profile card */}

        <div className="profile-tab" data-aos="fade-left">
          <Tabs
            items={[
              {
                key: "posts",
                label: (
                  <div className="d-flex align-items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      data-source-location="pages/Profile:642:14"
                      data-dynamic-content="false"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                      <path d="M3 9h18"></path>
                      <path d="M3 15h18"></path>
                      <path d="M9 3v18"></path>
                      <path d="M15 3v18"></path>
                    </svg>
                    <span>Posts</span>
                  </div>
                ),
              },
              {
                key: "classes",
                label: (
                  <div className="d-flex align-items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      data-filename="pages/Profile"
                      data-linenumber="646"
                      data-visual-selector-id="pages/Profile646"
                      data-source-location="pages/Profile:646:14"
                      data-dynamic-content="false"
                    >
                      <path d="M12 7v14"></path>
                      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
                    </svg>
                    <span>Classes</span>
                  </div>
                ),
              },
              {
                key: "clubs",
                label: (
                  <div className="d-flex align-items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      data-filename="pages/Profile"
                      data-linenumber="650"
                      data-visual-selector-id="pages/Profile650"
                      data-source-location="pages/Profile:650:14"
                      data-dynamic-content="false"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>Clubs</span>
                  </div>
                ),
              },
            ]}
            activeKey={pageTab}
            onSelect={(k) => setPageTab(k)}
            className="mb-0"
            fullWidth={false}
          />

          {/* Content below tabs */}
          {pageTab === "posts" && (
            <div data-aos="fade-up">
              {!canViewPosts && !isOwnProfile ? (
                <PrivateProfileMessage
                  followStatus={myFollowStatus}
                  username={profile?.username}
                />
              ) : isPostsLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="text-muted mt-2">Loading posts...</p>
                </div>
              ) : userPosts.length === 0 ? (
                <div className="no-post-yet">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    data-source-location="pages/Profile:677:20"
                    data-dynamic-content="false"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                    <path d="M3 9h18"></path>
                    <path d="M3 15h18"></path>
                    <path d="M9 3v18"></path>
                    <path d="M15 3v18"></path>
                  </svg>
                  <h3>No posts yet</h3>
                  <p>
                    {isOwnProfile
                      ? "Share your first post to get started!"
                      : `${
                          profile?.username || "This user"
                        } hasn't posted yet.`}
                  </p>
                </div>
              ) : (
                <div className="feed-page">
                  {userPosts.map((post) => (
                    <div key={post.id} className="feed-item feed-item-post">
                      <div className="feed-post">
                        <div className="post-header">
                          <div className="post-avatar">
                            {profile?.profile_image ? (
                              <Image
                                src={profile.profile_image}
                                alt={profile.full_name}
                                roundedCircle
                                className="avatar-img"
                              />
                            ) : (
                              <div className="avatar-placeholder">
                                {profile?.full_name?.[0]?.toUpperCase() || "U"}
                              </div>
                            )}
                          </div>
                          <div className="post-meta">
                            <div className="post-author">
                              {profile?.full_name || "Unknown User"}
                            </div>
                            <div className="post-time">
                              {formatPostDate(
                                post?.createdAt || post?.created_at,
                              )}
                            </div>
                          </div>
                          <div className="post-badges">
                            <Badge
                              bg={post.is_public ? "success" : "secondary"}
                              className="privacy-badge"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                {post.is_public ? (
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                ) : (
                                  <>
                                    <rect
                                      width="18"
                                      height="11"
                                      x="3"
                                      y="11"
                                      rx="2"
                                      ry="2"
                                    ></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                  </>
                                )}
                              </svg>
                              <span className="ms-1">
                                {post.is_public ? "Public" : "Private"}
                              </span>
                            </Badge>
                          </div>
                          {isOwnProfile && (
                            <Dropdown
                              show={openDropdownId === post.id}
                              onToggle={() =>
                                setOpenDropdownId(
                                  openDropdownId === post.id ? null : post.id,
                                )
                              }
                            >
                              <Dropdown.Toggle
                                variant="link"
                                className="post-menu-toggle"
                                id={`dropdown-post-${post.id}`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="1"></circle>
                                  <circle cx="12" cy="5" r="1"></circle>
                                  <circle cx="12" cy="19" r="1"></circle>
                                </svg>
                              </Dropdown.Toggle>

                              <Dropdown.Menu align="end">
                                <Dropdown.Item
                                  onClick={() => handleDeletePost(post.id)}
                                  disabled={isDeletingPost}
                                  className="text-danger"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="me-2"
                                  >
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                    <line
                                      x1="10"
                                      x2="10"
                                      y1="11"
                                      y2="17"
                                    ></line>
                                    <line
                                      x1="14"
                                      x2="14"
                                      y1="11"
                                      y2="17"
                                    ></line>
                                  </svg>
                                  {isDeletingPost
                                    ? "Deleting..."
                                    : "Delete Post"}
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          )}
                        </div>

                        {post.content && (
                          <div className="post-content">
                            <p>{post.content}</p>
                          </div>
                        )}

                        {(post.image_url || post.media_url) && (
                          <div className="post-image">
                            <Image
                              src={post.image_url || post.media_url}
                              alt="Post"
                              className="post-img"
                            />
                          </div>
                        )}

                        <div className="post-footer">
                          <CommentSection
                            post_id={post.id}
                            currentUserId={ownProfile?.id}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {pageTab === "classes" && (
            <div data-aos="fade-up">
              {isClassesLoading ? (
                <div className="text-muted">Loading classes…</div>
              ) : (
                <ClassesGrid classes={classes} />
              )}
            </div>
          )}

          {pageTab === "clubs" && (
            <div data-aos="fade-up">
              {isClubsLoading ? (
                <div className="text-muted">Loading clubs…</div>
              ) : (
                (() => {
                  const myClubsList = [...ownedClubs, ...joinedOrFollowing];
                  if (myClubsList.length === 0) {
                    return (
                      <div className="no-post-yet">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          data-filename="pages/Profile"
                          data-linenumber="729"
                          data-visual-selector-id="pages/Profile729"
                          data-source-location="pages/Profile:729:20"
                          data-dynamic-content="false"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <h3>Not in or following any clubs</h3>
                        <p>Join or follow a club to see it here!</p>
                      </div>
                    );
                  }
                  return (
                    <div className="myclub-card-main">
                      <Row>
                        {myClubsList.map((c) => {
                          const categoryName =
                            categoriesMap.get(c.category_id) || "";
                          const isOwnerClub = !!(
                            c.user_id &&
                            profile?.id &&
                            c.user_id === profile.id
                          );
                          const roleBadge = isOwnerClub
                            ? "Owner"
                            : Array.isArray(c.requests) &&
                                c.requests.some((r) => r.is_following)
                              ? "Following"
                              : "Member";
                          return (
                            <Col key={`club-${c.id}`} md={6} lg={6}>
                              <div
                                className="myclub-card"
                                onClick={() => navigate(`/clubs/${c.id}`)}
                              >
                                <div className="d-flex align-items-center gap-3">
                                  <div className="myclub-avatar">
                                    {c.club_profile_image ? (
                                      <img
                                        src={c.club_profile_image}
                                        alt={c.name}
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                          borderRadius: "inherit",
                                        }}
                                      />
                                    ) : (
                                      c.name?.[0]?.toLowerCase() || "c"
                                    )}
                                  </div>
                                  <div className="myclub-name">
                                    <h3>{c.name}</h3>
                                    <div className="d-flex align-items-center myclub-tags">
                                      <span>{roleBadge}</span>
                                      {categoryName ? (
                                        <span>{categoryName}</span>
                                      ) : null}

                                      <div className="userIcon">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          data-filename="pages/Profile"
                                          data-linenumber="752"
                                          data-visual-selector-id="pages/Profile752"
                                          data-source-location="pages/Profile:752:34"
                                          data-dynamic-content="false"
                                        >
                                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                          <circle cx="9" cy="7" r="4"></circle>
                                          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>{" "}
                                        {c.members_count || 0}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Col>
                          );
                        })}
                      </Row>
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <Modal
        className="profile-modal"
        show={settingsOpen}
        onHide={() => setSettingsOpen(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            items={[
              {
                key: "profile",
                label: (
                  <div className="d-flex align-items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      data-filename="components/profile/SettingsModal"
                      data-linenumber="222"
                      data-visual-selector-id="components/profile/SettingsModal222"
                      data-source-location="components/profile/SettingsModal:222:16"
                      data-dynamic-content="false"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Profile</span>
                  </div>
                ),
              },
              {
                key: "academic",
                label: (
                  <div className="d-flex align-items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      data-filename="components/profile/SettingsModal"
                      data-linenumber="226"
                      data-visual-selector-id="components/profile/SettingsModal226"
                      data-source-location="components/profile/SettingsModal:226:16"
                      data-dynamic-content="false"
                    >
                      <path d="M14 22v-4a2 2 0 1 0-4 0v4"></path>
                      <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"></path>
                      <path d="M18 5v17"></path>
                      <path d="m4 6 8-4 8 4"></path>
                      <path d="M6 5v17"></path>
                      <circle cx="12" cy="9" r="2"></circle>
                    </svg>
                    <span>Academic</span>
                  </div>
                ),
              },
              {
                key: "preferences",
                label: (
                  <div className="d-flex align-items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      data-filename="components/profile/SettingsModal"
                      data-linenumber="230"
                      data-visual-selector-id="components/profile/SettingsModal230"
                      data-source-location="components/profile/SettingsModal:230:16"
                      data-dynamic-content="false"
                    >
                      <circle
                        cx="13.5"
                        cy="6.5"
                        r=".5"
                        fill="currentColor"
                      ></circle>
                      <circle
                        cx="17.5"
                        cy="10.5"
                        r=".5"
                        fill="currentColor"
                      ></circle>
                      <circle
                        cx="8.5"
                        cy="7.5"
                        r=".5"
                        fill="currentColor"
                      ></circle>
                      <circle
                        cx="6.5"
                        cy="12.5"
                        r=".5"
                        fill="currentColor"
                      ></circle>
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
                    </svg>
                    <span>Preferences</span>
                  </div>
                ),
              },
              {
                key: "account",
                label: (
                  <div className="d-flex align-items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      data-filename="components/profile/SettingsModal"
                      data-linenumber="234"
                      data-visual-selector-id="components/profile/SettingsModal234"
                      data-source-location="components/profile/SettingsModal:234:16"
                      data-dynamic-content="false"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" x2="12" y1="8" y2="12"></line>
                      <line x1="12" x2="12.01" y1="16" y2="16"></line>
                    </svg>
                    <span>Account</span>
                  </div>
                ),
              },
            ]}
            activeKey={settingsTab}
            onSelect={(k) => setSettingsTab(k)}
            fullWidth={false}
          />

          {settingsTab === "profile" && (
            <div className="tab-pane">
              <div className="changes-photo-main d-flex flex-wrap align-items-center">
                <div className="avatar-md">
                  {profile?.profile_image ? (
                    <img
                      src={profile.profile_image}
                      alt="Profile"
                      className="profile-image"
                    />
                  ) : (
                    <span>
                      {String(profile?.full_name || profile?.username || "U")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileSelected}
                  style={{ display: "none" }}
                />
                <Button
                  variant="outline-secondary"
                  onClick={onChangePhotoClick}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    data-filename="components/profile/SettingsModal"
                    data-linenumber="255"
                    data-visual-selector-id="components/profile/SettingsModal255"
                    data-source-location="components/profile/SettingsModal:255:22"
                    data-dynamic-content="false"
                  >
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                    <circle cx="12" cy="13" r="3"></circle>
                  </svg>
                  Change Photo
                </Button>
              </div>
              <Form onSubmit={formik.handleSubmit} className="profile-info">
                <Row>
                  <Col md={6}>
                    <TNInput
                      label="Display Name"
                      name="full_name"
                      type="text"
                      placeholder="Display name"
                      value={formik.values.full_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors}
                      touched={formik.touched}
                    />
                  </Col>
                  <Col md={6}>
                    <TNInput
                      label="Username"
                      name="username"
                      type="text"
                      value={formik.values.username}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors}
                      touched={formik.touched}
                    />
                  </Col>
                  <Col md={6}>
                    <TNInput
                      label="Birthday"
                      type="date"
                      name="birthday"
                      placeholder="mm/dd/yyyy"
                      value={formik.values.birthday}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors}
                      touched={formik.touched}
                    />
                  </Col>
                  <Col md={6}>
                    <TNInput
                      label="Phone Number"
                      name="phone_number"
                      placeholder="Your phone number"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.phone_number}
                      error={formik.errors}
                      touched={formik.touched}
                    />
                  </Col>
                  <Col md={12}>
                    <TNInput
                      label="City"
                      name="city"
                      placeholder="Your city"
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors}
                      touched={formik.touched}
                    />
                  </Col>
                  <Col md={12}>
                    <TNInput
                      label="Bio"
                      type="textarea"
                      name="bio"
                      placeholder="Tell others about yourself..."
                      value={formik.values.bio}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors}
                      touched={formik.touched}
                    />
                  </Col>
                  <Col md={12} className="mb-0">
                    <TNInput
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formik.values.email}
                      disabled
                      error={formik.errors}
                      touched={formik.touched}
                    />
                    <div className="email-cannot">
                      <p>Email cannot be changed. Contact support if needed.</p>
                    </div>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          {settingsTab === "academic" && (
            <div className="tab-pane">
              <Form onSubmit={formik.handleSubmit}>
                <Row>
                  <Col md={12}>
                    <TNInput
                      type="select"
                      options={educationalInstitutionsOptions}
                      label="University/College"
                      name="educational_institution_id"
                      placeholder="Select your university"
                      value={formik.values.educational_institution_id}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors}
                      touched={formik.touched}
                    />
                  </Col>
                  <Col md={6} className="mb-0">
                    <TNInput
                      label={"Academic Year"}
                      type="select"
                      name="academic_year"
                      options={[
                        { value: "", label: "Select year" },
                        { value: "1", label: "1st Year" },
                        { value: "2", label: "2nd Year" },
                        { value: "3", label: "3rd Year" },
                        { value: "4", label: "4th Year" },
                        { value: "5", label: "Freshman" },
                        { value: "6", label: "Sophomore" },
                        { value: "7", label: "Junior" },
                        { value: "8", label: "Senior" },
                        { value: "9", label: "Graduateaaa" },
                      ]}
                      value={formik.values.academic_year}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors}
                      touched={formik.touched}
                    />
                  </Col>
                  <Col md={6} className="mb-0">
                    <TNInput
                      label="Major/Program"
                      name="major"
                      placeholder="Your major"
                      value={formik.values.major}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.errors}
                      touched={formik.touched}
                    />
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          {settingsTab === "preferences" && (
            <div className="tab-pane">
              <TNInput
                label="Grade Display Format"
                type="select"
                name="grade_display_format"
                options={[
                  { value: "percentage", label: "Percentage (e.g., 95%)" },
                  { value: "letter_grade", label: "Letter (e.g., A)" },
                  { value: "gpa", label: "GPA (e.g., 3.7)" },
                ]}
                value={formik.values.grade_display_format}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors}
                touched={formik.touched}
              />

              <div className="account-privacy-main">
                <label>Account Privacy</label>
                <div className="d-flex flex-wrap justify-content-between align-items-center private-inner">
                  <div className="private-account">
                    <h4>Private Account</h4>
                    <p>
                      When your account is private, people need to request to
                      follow you
                    </p>
                  </div>
                  <Form.Check
                    type="switch"
                    id="account-privacy-switch"
                    label=""
                    name="account_privacy"
                    checked={!!formik.values.account_privacy}
                    onChange={(e) =>
                      formik.setFieldValue("account_privacy", e.target.checked)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {settingsTab === "account" && (
            <div className="tab-pane">
              <div className="alert-soft-danger">
                <h4>Sign Out</h4>
                <p>
                  This will sign you out of your CampusClip account on this
                  device.
                </p>
                <Button variant="outline-danger" onClick={onSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="cancel-add-btn">
          <Button
            variant="light"
            onClick={() => setSettingsOpen(false)}
            disabled={isEditPending}
          >
            Cancel
          </Button>
          <Button
            variant="btns"
            onClick={() => formik.handleSubmit()}
            disabled={isEditPending || isProfileLoading}
          >
            {isEditPending ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cropper Modal */}
      <ProfilePhotoCropper
        show={cropperOpen}
        src={cropSrc}
        onCancel={onCropCancel}
        onSave={onCropSave}
      />

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        show={showPhotoModal}
        onHide={() => setShowPhotoModal(false)}
        imageUrl={profile?.profile_image}
        userName={profile?.full_name || userStore?.name}
      />
      </DashboardLayout>
    </>
  );
};

export default Profile;
