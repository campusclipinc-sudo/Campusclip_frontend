import React from 'react';
import { Card, Image } from 'react-bootstrap';
import { format } from 'date-fns';

const PostList = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-4">
        <p>No posts yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <Card key={post.id} className="mb-3">
          <Card.Body>
            <div className="d-flex align-items-center mb-3">
              <div className="avatar-circle me-2">
                {post.author?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h6 className="mb-0">
                  {post.author?.full_name || 'Unknown User'}
                  {post.club && (
                    <span className="text-muted"> in {post.club.name}</span>
                  )}
                </h6>
                <small className="text-muted">
                  {format(new Date(post.created_at), 'MMM d, yyyy h:mm a')}
                </small>
              </div>
            </div>
            
            {post.content && <Card.Text className="mb-3">{post.content}</Card.Text>}
            
            {post.image_url && (
              <div className="mb-3">
                <Image
                  src={post.image_url}
                  alt="Post media"
                  fluid
                  className="rounded"
                  style={{ maxHeight: '400px', width: 'auto' }}
                />
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default PostList;
