import React, { useMemo, useState } from "react";
import { Row, Col, Card, Button, Badge, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import DashboardLayout from "../../component/DashboardLayout";
import SEOHead from "../../components/SEOHead";
import { getMetadata } from "../../utils/seoConfig";
import CreateClubModal from "./CreateClubModal";
import "../../scss/clubs.scss";
import AOS from "aos";
import "aos/dist/aos.css";
import { useListClubs, useListCategories } from "../../hooks/useRQClub";
import { useFollowClub, useRequestClub } from "../../hooks/useRQClubRequest";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { NotificationDot } from "../../components/NotificationIndicators";
import { selectClubNotifications } from "../../store/notificationSlice";

const ClubCard = ({
  name,
  category = "Social",
  members = 1,
  actionLabel = "Join",
  subtleAction = "Follow",
  onPrimary,
  onSubtle,
  primaryLoading = false,
  subtleLoading = false,
  disabled = false,
  image,
  onClick,
  isMember = false,
}) => (
  <div className="discover-clubs-box" onClick={onClick}>
    <div className="d-flex align-items-center flex-wrap discover-clubs-head">
      <div className="club-avatar">
        {image ? (
          <img className="club-avatar" src={image} alt={name} />
        ) : (
          <div className="club-avatar">{name?.[0]?.toUpperCase() || "C"}</div>
        )}
      </div>
      <div className="flex-grow-1 ms-2">
        <h4 title={name}>{name}</h4>
        <span>{category}</span>
      </div>
    </div>

    <div className="d-flex justify-content-between align-items-center mb-2">
      <div className="members">
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
          data-filename="pages/Clubs"
          data-linenumber="379"
          data-visual-selector-id="pages/Clubs379"
          data-source-location="pages/Clubs:379:30"
          data-dynamic-content="false"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>{" "}
        {members}
      </div>

      <div
        className="d-flex align-items-center foll-btn"
        onClick={onSubtle}
        disabled={disabled || subtleLoading}
      >
        {subtleLoading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          subtleAction
        )}
      </div>
    </div>

    <div className="requested-btn">
      <button
        className="btn btn-btns"
        onClick={onPrimary}
        disabled={disabled || primaryLoading}
      >
        {primaryLoading ? `${actionLabel}...` : actionLabel}
      </button>
    </div>
  </div>
);

const MyClubCard = ({
  name = "test",
  role = "Admin",
  members = 1,
  onClick,
  isAdmin = false,
  image,
  showUnread = false,
}) => (
  <div
    className="myclub-card d-flex flex-wrap align-items-center"
    onClick={onClick}
    style={{ cursor: onClick ? "pointer" : "default" }}
  >
          {showUnread && <NotificationDot />}
    <div className="myclub-card-img">
      {image ? (
        <img className="myclub-card-img" src={image} alt={name} />
      ) : (
        <div className="myclub-card-img">{name?.[0]?.toLowerCase() || "t"}</div>
      )}
    </div>
    <div className="myclub-card-name">
      <div className="card-name-top d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <h4 className="mb-0">{name}</h4>
        </div>
        {isAdmin && (
          <span>
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
              data-filename="pages/Clubs"
              data-linenumber="371"
              data-visual-selector-id="pages/Clubs371"
              data-source-location="pages/Clubs:371:32"
              data-dynamic-content="false"
            >
              <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path>
              <path d="M5 21h14"></path>
            </svg>{" "}
            Admin
          </span>
        )}
      </div>
      <div className="card-name-bottom d-flex justify-content-between align-items-center">
        <span>{role}</span>
        <div className="members">
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
            data-filename="pages/Clubs"
            data-linenumber="379"
            data-visual-selector-id="pages/Clubs379"
            data-source-location="pages/Clubs:379:30"
            data-dynamic-content="false"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>{" "}
          {members}
        </div>
      </div>
    </div>
  </div>
);

const Clubs = () => {
  const metadata = getMetadata("clubs");
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const currentUser = useSelector((state) => state.user?.user);
  const clubNotifications = useSelector(selectClubNotifications);
  const currentUserId = currentUser?.id;
  const {
    data: clubsRes,
    isLoading: isLoadingClubs,
    refetch: getListClubs,
  } = useListClubs();
  const { data: catRes, isLoading: isLoadingCategories } = useListCategories();
  const { mutate: requestClub, isPending } = useRequestClub((res) => {
    getListClubs();
  });
  const { mutate: followClub, isPending: followPending } = useFollowClub(
    (res) => {
      getListClubs();
    },
  );
  const categories = useMemo(() => {
    const arr = Array.isArray(catRes?.data) ? catRes.data : [];
    const map = new Map();
    arr.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [catRes]);

  React.useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-quart",
      once: true,
      offset: 40,
    });
  }, []);

  // Support both old and new API response shapes
  const clubsData = clubsRes?.data;
  const myClubs = Array.isArray(clubsData)
    ? []
    : Array.isArray(clubsData?.myClubs)
      ? clubsData.myClubs
      : [];
  const otherClubs = Array.isArray(clubsData)
    ? clubsData
    : Array.isArray(clubsData?.otherClubs)
      ? clubsData.otherClubs
      : [];
  // const totalClubs = Array.isArray(clubsData)
  //   ? clubsData.length
  //   : typeof clubsData?.total === "number"
  //   ? clubsData.total
  //   : otherClubs.length + myClubs.length;

  return (
    <>
      <SEOHead {...metadata} />
      <DashboardLayout>
      <div className="campus-clubs-main">
        <div
          className="d-flex flex-wrap align-items-center justify-content-between page-head"
          data-aos="fade-down"
        >
          <div className="titles d-flex flex-wrap align-items-center">
            <div className="title-icon">
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
                data-filename="pages/Clubs"
                data-linenumber="336"
                data-visual-selector-id="pages/Clubs336"
                data-source-location="pages/Clubs:336:14"
                data-dynamic-content="false"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="title">
              <h2>Campus Clubs</h2>
              <p>Connect with communities that share your interests</p>
            </div>
          </div>

          <div className="actions d-flex gap-3">
            <Button variant="btns" onClick={() => setShowCreate(true)}>
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
                data-filename="pages/Clubs"
                data-linenumber="344"
                data-visual-selector-id="pages/Clubs344"
                data-source-location="pages/Clubs:344:12"
                data-dynamic-content="false"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>{" "}
              Create Club
            </Button>
          </div>
        </div>

        <div className="my-clubs-main" data-aos="fade-right">
          <h3>
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
              className="lucide lucide-users w-5 h-5"
              data-filename="pages/Clubs"
              data-linenumber="359"
              data-visual-selector-id="pages/Clubs359"
              data-source-location="pages/Clubs:359:14"
              data-dynamic-content="false"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>{" "}
            <span className="d-inline-flex align-items-center">
              My Clubs
            </span>
          </h3>
          <Row>
            {isLoadingClubs ? (
              <Col>
                <div className="d-flex align-items-center gap-2 py-4">
                  <Spinner animation="border" size="sm" variant="primary" />
                  <span>Loading your clubs...</span>
                </div>
              </Col>
            ) : myClubs.length > 0 ? (
              myClubs.map((c) => {
                const isAdmin = currentUserId && c.user_id === currentUserId;
                return (
                  <Col
                    key={`my-${c.id}`}
                    md={6}
                    lg={5}
                    xl={4}
                    data-aos="zoom-in"
                    data-aos-delay="100"
                  >
                    <MyClubCard
                      name={c.name}
                      role={c.role || c.user_role || "Member"}
                      members={c.members_count || 0}
                      onClick={() => navigate(`/clubs/${c.id}`)}
                      isAdmin={isAdmin}
                      image={c.club_profile_image}
                      showUnread={!!clubNotifications.byClub?.[c.id]?.hasUnread}
                    />
                  </Col>
                );
              })
            ) : (
              <Col>
                <div className="text-muted small">
                  You have not joined any clubs yet.
                </div>
              </Col>
            )}
          </Row>
        </div>

        <div className="my-clubs-main discover-Clubs-main" data-aos="fade-left">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>
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
                data-filename="pages/Clubs"
                data-linenumber="396"
                data-visual-selector-id="pages/Clubs396"
                data-source-location="pages/Clubs:396:12"
                data-dynamic-content="false"
              >
                <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              Discover Clubs
            </h3>
            {otherClubs.length > 10 && (
              <Link to="/search/clubs" className="view-more-link">
                View more
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
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Link>
            )}
          </div>

          <Row>
            {isLoadingClubs || isLoadingCategories ? (
              <Col>
                <div className="d-flex align-items-center gap-2 py-4">
                  <Spinner animation="border" size="sm" variant="primary" />
                  <span>Loading clubs...</span>
                </div>
              </Col>
            ) : otherClubs.length === 0 ? (
              <Col>
                <div className="text-muted small py-4">
                  No clubs available to discover at the moment.
                </div>
              </Col>
            ) : (
              otherClubs.slice(0, 10).map((c) => {
                const hasPending = Array.isArray(c.requests)
                  ? c.requests.some((r) => r.status === "pending")
                  : false;
                const isFollowing = c.is_following === true;

                const label = hasPending
                  ? "Requested"
                  : c.is_public
                    ? "Join"
                    : "Request";

                const subtleLabel = isFollowing ? "Following" : "Follow";

                return (
                  <Col
                    key={c.id}
                    sm={6}
                    md={4}
                    lg={3}
                    xl={3}
                    data-aos="fade-up"
                    data-aos-delay="200"
                  >
                    <ClubCard
                      name={c.name}
                      category={categories.get(c.category_id) || ""}
                      members={c.members_count || 0}
                      actionLabel={label}
                      subtleAction={subtleLabel}
                      onPrimary={() => {
                        requestClub({ club_id: c.id, is_following: false });
                      }}
                      onSubtle={() => {
                        followClub({ following_club: c.id });
                      }}
                      primaryLoading={isPending}
                      subtleLoading={followPending}
                      onClick={() => navigate(`/clubs/${c.id}`)}
                      image={c.club_profile_image}
                      isMember={true}
                    />
                  </Col>
                );
              })
            )}
          </Row>
        </div>

        <CreateClubModal
          show={showCreate}
          onHide={() => setShowCreate(false)}
          onSuccess={() => getListClubs()}
        />
      </div>
      </DashboardLayout>
    </>
  );
};

export default Clubs;
