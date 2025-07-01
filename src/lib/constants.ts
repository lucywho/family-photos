export const APP_NAME = 'Toman Family Photos';
export const APP_DESCRIPTION = 'View and manage your family photos';

// Auth constants
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_REQUIREMENTS = 'Does not meet password requirements';

// Form constants: note upper limits in database schema
export const MAX_TITLE_LENGTH = 50;
export const MAX_NOTES_LENGTH = 500;
export const MAX_TAG_LENGTH = 20;
export const MAX_ALBUM_NAME_LENGTH = 30;

// Date format
export const DATE_FORMAT = 'dd/mm/yyyy';

// Session timeout (in minutes)
export const SESSION_TIMEOUT = 30;

// Pagination
export const ITEMS_PER_PAGE = 12;

// Album page
export const ALBUMS_PER_PAGE = 12;

// Photo page, limits number of times the app tries to load a failing image
export const MAX_RETRIES = 3;

// Limits number of tags a single photo can have
export const MAX_TAGS = 20;
