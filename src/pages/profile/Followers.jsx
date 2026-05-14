import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Spinner } from "react-bootstrap";
import { useGetFollowers } from "../../hooks/useRQUserFollowing";
import { useSelector } from "react-redux";
import DashboardLayout from "../../component/DashboardLayout";
import "../../scss/profile.scss";

const Followers = () => {
	const navigate = useNavigate();
	const { userId } = useParams();
	const currentUser = useSelector((state) => state.user?.user);

	// If no userId in params, use current user's ID
	const targetUserId = userId || currentUser?.id;
	const isOwnProfile = !userId || userId === currentUser?.id;

	const { data: followersData, isLoading } = useGetFollowers(targetUserId);
	// Extract followers array from nested structure
	const followers = Array.isArray(followersData?.data?.followers)
		? followersData.data.followers
		: Array.isArray(followersData?.data)
			? followersData.data
			: Array.isArray(followersData)
				? followersData
				: [];

	return (
		<DashboardLayout>
			<div className="following-page-main">
				<div className="followers-page">
					<div className="followers-header">
						<button
							className="back-button"
							onClick={() =>
								navigate(isOwnProfile ? "/profile" : `/students/${userId}`)
							}
							aria-label="Go back"
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
							>
								<path d="m12 19-7-7 7-7"></path>
								<path d="M19 12H5"></path>
							</svg>
						</button>
						<div>
							<h2>Followers</h2>
							<p className="text-muted">@{currentUser?.username || "user"}</p>
						</div>
					</div>

					{isLoading ? (
						<div className="text-center py-5">
							<Spinner animation="border" variant="primary" />
							<p className="text-muted mt-2">Loading followers...</p>
						</div>
					) : followers.length === 0 ? (
						<div className="no-data text-center py-5">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="64"
								height="64"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="mb-3 text-muted"
							>
								<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
								<circle cx="9" cy="7" r="4"></circle>
								<path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
								<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
							</svg>
							<h3 className="text-muted">No followers yet</h3>
							<p className="text-muted">
								{isOwnProfile
									? "When people follow you, they'll appear here"
									: "This user doesn't have any followers yet"}
							</p>
						</div>
					) : (
						<div className="followers-list">
							{followers.map((follower) => (
								<div
									key={follower.id}
									className="follower-item"
									onClick={() =>
										navigate(`/students/${follower?.id || follower.id}`)
									}
									style={{ cursor: "pointer" }}
								>
									<div className="d-flex align-items-center gap-3">
										<div className="follower-avatar">
											{follower.follower?.profile_image ||
												follower.profile_image ? (
												<img
													src={
														follower.follower?.profile_image ||
														follower.profile_image
													}
													alt={follower.follower?.full_name || follower.full_name}
													className="rounded-circle"
													style={{ width: 50, height: 50, objectFit: "cover" }}
												/>
											) : (
												<div
													className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
													style={{
														width: 50,
														height: 50,
														fontSize: "1.25rem",
														fontWeight: "bold",
													}}
												>
													{(
														follower.follower?.full_name?.[0] ||
														follower.full_name?.[0] ||
														"U"
													).toUpperCase()}
												</div>
											)}
										</div>
										<div className="follower-info flex-grow-1">
											<h5 className="mb-0">
												{follower.follower?.full_name ||
													follower.full_name ||
													"Unknown User"}
											</h5>
											<p className="text-muted mb-0 small">
												@
												{follower.follower?.username ||
													follower.username ||
													"username"}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
};

export default Followers;
