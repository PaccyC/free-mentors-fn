export const GET_MENTORS = `
  query {
    mentors {
      id firstName lastName email bio address occupation expertise role
    }
  }
`;

export const GET_MENTOR = `
  query GetMentor($id: ID!) {
    mentor(id: $id) {
      id firstName lastName email bio address occupation expertise role
    }
  }
`;

export const GET_ME = `
  query {
    me {
      id firstName lastName email bio address occupation expertise role
    }
  }
    
`;

export const GET_MY_SESSIONS = `
  query {
    mySessions {
      id questions status scheduledAt createdAt
      mentor { id firstName lastName email occupation expertise }
      mentee { id firstName lastName email }
    }
  }
`;

export const GET_MENTOR_SESSIONS = `
  query {
    mentorSessions {
      id questions status scheduledAt createdAt
      mentee { id firstName lastName email }
      mentor { id firstName lastName email }
    }
  }
`;

export const GET_MENTOR_REVIEWS = `
  query GetMentorReviews($mentorId: ID!) {
    mentorReviews(mentorId: $mentorId) {
      id score comment createdAt
      mentee { id firstName lastName }
    }
  }
`;

export const GET_ALL_USERS = `
  query {
    allUsers {
      id firstName lastName email role occupation expertise bio address
    }
  }
`;

export const GET_ALL_REVIEWS = `
  query {
    allReviews {
      id score comment isHidden createdAt
      mentee { id firstName lastName }
      mentor { id firstName lastName }
    }
  }
`;
