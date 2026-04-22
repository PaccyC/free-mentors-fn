export const SIGNUP = `
  mutation Signup(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
    $bio: String
    $address: String
    $occupation: String
    $expertise: String
  ) {
    signup(
      firstName: $firstName
      lastName: $lastName
      email: $email
      password: $password
      bio: $bio
      address: $address
      occupation: $occupation
      expertise: $expertise
    ) {
      token
      user { id firstName lastName email role }
    }
  }
`;

export const LOGIN = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user { id firstName lastName email role }
    }
  }
`;

export const CHANGE_USER_TO_MENTOR = `
  mutation ChangeUserToMentor($userId: ID!) {
    changeUserToMentor(userId: $userId) {
      id firstName lastName email role
    }
  }
`;

export const CREATE_SESSION = `
  mutation CreateSession($mentorId: ID!, $questions: String!, $scheduledAt: DateTime!) {
    createSession(mentorId: $mentorId, questions: $questions, scheduledAt: $scheduledAt) {
      id questions status scheduledAt createdAt
      mentor { id firstName lastName }
    }
  }
`;

export const ACCEPT_SESSION = `
  mutation AcceptSession($sessionId: ID!) {
    acceptSession(sessionId: $sessionId) {
      id status
    }
  }
`;

export const DECLINE_SESSION = `
  mutation DeclineSession($sessionId: ID!) {
    declineSession(sessionId: $sessionId) {
      id status
    }
  }
`;

export const REVIEW_MENTOR = `
  mutation ReviewMentor($mentorId: ID!, $score: Int!, $comment: String!) {
    reviewMentor(mentorId: $mentorId, score: $score, comment: $comment) {
      id score comment
    }
  }
`;

export const HIDE_REVIEW = `
  mutation HideReview($reviewId: ID!) {
    hideReview(reviewId: $reviewId) {
      id isHidden
    }
  }
`;
