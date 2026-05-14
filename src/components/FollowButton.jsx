import React from 'react';
import { Button } from 'react-bootstrap';
import { useToggleFollow } from '../hooks/useRQUserFollowing';
import { useQueryClient } from '@tanstack/react-query';

const FollowButton = ({ userId, followStatus, isPrivate }) => {
  const queryClient = useQueryClient();

  const { mutate: toggleFollow, isPending } = useToggleFollow(
    () => {
      // Invalidate user profile queries to refresh follow status
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-posts', userId] });
    }
  );

  const handleClick = () => {
    toggleFollow({ following_user: userId });
  };

  // Button states based on follow status
  if (followStatus === 'accepted') {
    return (
      <Button
        variant="outline-primary"
        onClick={handleClick}
        disabled={isPending}
        className="btn-sm"
      >
        {isPending ? 'Processing...' : 'Following'}
      </Button>
    );
  }

  if (followStatus === 'pending') {
    return (
      <Button
        variant="outline-secondary"
        disabled
        className="btn-sm"
      >
        Requested
      </Button>
    );
  }

  // Default: not following
  return (
    <Button
      variant="primary"
      onClick={handleClick}
      disabled={isPending}
      className="btn-sm"
    >
      {isPending ? 'Processing...' : 'Follow'}
    </Button>
  );
};

export default FollowButton;
