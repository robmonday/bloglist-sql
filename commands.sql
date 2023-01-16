CREATE TABLE blogs (
    id SERIAL UNIQUE PRIMARY KEY,
    author text,
  	title text NOT NULL,
  	url text NOT NULL,
    likes integer DEFAULT 0,
);