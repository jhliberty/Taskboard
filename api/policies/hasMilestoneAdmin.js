// api/policies/hasMilestoneAdmin.js

/**
 * Policy to check if user has admin rights to milestone in specified project or not. Actual check is
 * done by one of following internal AuthService methods;
 *
 *  - hasProjectAdmin
 *  - hasMilestoneAdmin
 *
 * Note that this policy relies one of following parameters is present:
 *
 *  - id
 *  - milestoneId
 *  - projectId
 *
 * Actual auth checks are done depending of given parameters.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasMilestoneAdmin(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasMilestoneAdmin.js");

    var id = parseInt(request.param("id"), 10);
    var milestoneId = parseInt(request.param("milestoneId"), 10);
    var projectId = parseInt(request.param("projectId"), 10);

    // Milestone id parameter found
    if (!isNaN(id) || !isNaN(milestoneId)) {
        milestoneId = !isNaN(milestoneId) ? milestoneId : id;

        // Check that current user has admin access to specified milestone
        AuthService.hasMilestoneAdmin(request.user, milestoneId, function(error, hasRight) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else if (!hasRight) { // No admin rights
                return ErrorService.makeErrorResponse(403, "Insufficient rights to admin milestone.", request, response);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (!isNaN(projectId)) { // Project id parameter found
        // Check that current user has update access to specified project
        AuthService.hasProjectAdmin(request.user, projectId, function(error, hasRight) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else if (!hasRight) { // No admin rights
                return ErrorService.makeErrorResponse(403, "Insufficient rights to admin milestone.", request, response);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else {
        return ErrorService.makeErrorResponse(403, "Cannot identify milestone.", request, response);
    }
};
