import PropTypes from 'prop-types';
import stylePropTypes from '@styles/stylePropTypes';
import RESIZE_MODES from './resizeModes';
import sourcePropTypes from './sourcePropTypes';

const imagePropTypes = {
    /** Styles for the Image */
    style: stylePropTypes,

    /** The static asset or URI source of the image */
    source: sourcePropTypes.isRequired,

    /** Should an auth token be included in the image request */
    isAuthTokenRequired: PropTypes.bool,

    /** How should the image fit within its container */
    resizeMode: PropTypes.string,

    /** Event for when the image begins loading */
    onLoadStart: PropTypes.func,

    /** Event for when the image finishes loading */
    onLoadEnd: PropTypes.func,

    /** Event for when the image is fully loaded and returns the natural dimensions of the image */
    onLoad: PropTypes.func,

    /** Progress events while the image is downloading */
    onProgress: PropTypes.func,

    /* Onyx Props */
    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user authToken */
        authToken: PropTypes.string,
    }),

    /** Whether we should show the top of the image */
    objectPositionTop: PropTypes.string
};

const defaultProps = {
    style: [],
    session: {
        authToken: null,
    },
    isAuthTokenRequired: false,
    resizeMode: RESIZE_MODES.cover,
    objectPositionTop: false,
    onLoadStart: () => {},
    onLoadEnd: () => {},
    onLoad: () => {},
};

export {imagePropTypes, defaultProps};
