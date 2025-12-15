import { useState, useEffect } from 'react';
import { authClient } from '../lib/auth-client';

interface Comment {
  commentId: string;
  commenterId: string;
  content: string;
  createdAt: string;
}

interface CommentsProps {
  pictureId: string;
  isOwner?: boolean;
}

export default function Comments({ pictureId, isOwner = false }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Check if user is logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await authClient.getSession();
      setSession(data);
    };
    checkSession();
  }, []);

  // Load comments
  useEffect(() => {
    loadComments();
  }, [pictureId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/comments/${pictureId}`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !session) return;

    try {
      setSubmitting(true);
      const response = await fetch(`http://localhost:3000/api/comments/${pictureId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const data = await response.json();
      setComments([data.comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please make sure you are logged in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {/* Comment Form - Only show if user unlocked the picture and is logged in */}
      {!isOwner && session && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Leave a comment..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      {/* Message for non-logged in users */}
      {!isOwner && !session && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            Sign in to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.commentId}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <p className="text-gray-800">{comment.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
