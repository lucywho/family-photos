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

//Privacy statment
export const PRIVACY_STATEMENT = ` 
                          <span class='font-bold text-primary'>
                            Privacy:
                          </span>
                          We collect and store your data for the sole purpose of
                          providing secure access and communication. Your email
                          address will only be used for account verification and
                          password resets. We do not share your personal
                          data with third parties or use it for marketing.                     
                        <br />
                        <br />                 
                          <span class='font-bold text-primary'>
                            Cookies:
                          </span>
                          This app uses a single session cookie that is strictly
                          necessary for authentication and to keep you securely
                          logged in. This cookie does not track your activity
                          and is automatically deleted after you log out or
                          after a period of inactivity. <br /> In accordance with the
                          EU General Data Protection Regulation (GDPR) and the
                          ePrivacy Directive, this essential cookie does not
                          require your explicit consent, but by using the app,
                          you acknowledge and accept its use.
                        <br />
                        <br />
                          <span class='font-bold text-primary'>
                            Rights:
                          </span>
                          You have the right to:
                          <li>Access your personal data</li>
                          <li>Request correction or deletion</li>
                          <li>Withdraw your consent at any time</li>
                          To request changes or deletion of your data, please
                          contact the app administrator
                        `;
