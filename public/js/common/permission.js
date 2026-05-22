// public/js/common/permissions.js



/*
|--------------------------------------------------------------------------
| GLOBAL STATE
|--------------------------------------------------------------------------
*/

window.currentUser = null

window.currentPermissions = []



/*
|--------------------------------------------------------------------------
| LOAD CURRENT USER
|--------------------------------------------------------------------------
*/

async function loadCurrentUser() {

    try {

        /*
        |--------------------------------------------------------------------------
        | API
        |--------------------------------------------------------------------------
        */

        const response = await fetch(
            '/api/auth/me'
        )



        const result =
            await response.json()



        if (!result.success) {

            console.error(
                'Cannot load current user'
            )

            return null

        }



        /*
        |--------------------------------------------------------------------------
        | USER
        |--------------------------------------------------------------------------
        */

        window.currentUser =
            result.data || null



        /*
        |--------------------------------------------------------------------------
        | EXTRACT PERMISSIONS
        |--------------------------------------------------------------------------
        */

        const permissions =
            result.data?.permissions || []



        /*
        |--------------------------------------------------------------------------
        | NORMALIZE
        |--------------------------------------------------------------------------
        */

        window.currentPermissions =
            permissions
                .map(item => {

                    /*
                    |--------------------------------------------------------------------------
                    | STRING
                    |--------------------------------------------------------------------------
                    */

                    if (
                        typeof item === 'string'
                    ) {

                        return item

                    }



                    /*
                    |--------------------------------------------------------------------------
                    | OBJECT WITH CODE
                    |--------------------------------------------------------------------------
                    */

                    if (
                        item.code
                    ) {

                        return item.code

                    }



                    /*
                    |--------------------------------------------------------------------------
                    | module_key + action_key
                    |--------------------------------------------------------------------------
                    */

                    if (
                        item.module_key
                        &&
                        item.action_key
                    ) {

                        return `${item.module_key}.${item.action_key}`

                    }



                    return null

                })
                .filter(Boolean)



        console.log(
            'Current User:',
            window.currentUser
        )



        console.log(
            'Current Permissions:',
            window.currentPermissions
        )



        return window.currentUser

    } catch (err) {

        console.error(err)

        return null

    }

}



/*
|--------------------------------------------------------------------------
| HAS PERMISSION
|--------------------------------------------------------------------------
*/

function hasPermission(
    permission
) {

    /*
    |--------------------------------------------------------------------------
    | NO PERMISSION REQUIRED
    |--------------------------------------------------------------------------
    */

    if (!permission) {
        return true
    }



    /*
    |--------------------------------------------------------------------------
    | EMPTY
    |--------------------------------------------------------------------------
    */

    if (
        !Array.isArray(
            window.currentPermissions
        )
    ) {

        return false

    }



    return window.currentPermissions.includes(
        permission
    )

}



/*
|--------------------------------------------------------------------------
| REQUIRE PERMISSION
|--------------------------------------------------------------------------
*/

function requirePermission(
    permission
) {

    if (
        hasPermission(permission)
    ) {

        return true

    }



    /*
    |--------------------------------------------------------------------------
    | REDIRECT
    |--------------------------------------------------------------------------
    */

    window.location.href =
        '/403'



    return false

}



/*
|--------------------------------------------------------------------------
| APPLY PERMISSION UI
|--------------------------------------------------------------------------
*/

function applyPermissionUI() {

    /*
    |--------------------------------------------------------------------------
    | ELEMENTS
    |--------------------------------------------------------------------------
    */

    const elements = document.querySelectorAll('[data-permission]')



    elements.forEach(el => {

        const permission = el.dataset.permission



        /*
        |--------------------------------------------------------------------------
        | HIDE
        |--------------------------------------------------------------------------
        */

        if (hasPermission(permission)) {
            console.log('permission', permission)
            el.classList.remove('permission-hidden')

        }

    })

}

/*
|--------------------------------------------------------------------------
| INIT PERMISSION SYSTEM
|--------------------------------------------------------------------------
*/

async function initPermissionSystem() {

    await loadCurrentUser()
    applyPermissionUI()

}