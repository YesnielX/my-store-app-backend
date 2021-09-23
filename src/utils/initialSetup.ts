import Role from '../database/models/role.model';

export const initialSetup = async (): Promise<void> => {
    const estimated = await Role.estimatedDocumentCount();

    if (estimated === 0) {
        Role.create({
            name: 'shop_level1',
            description:
                'role with permissions 5 max, maxStores, maxProducts, maxManagers, maxEmployees',
            permissions: {
                maxStores: 5,
                maxProducts: 5,
                maxManagers: 5,
                maxEmployees: 5,
            },
        });

        Role.create({
            name: 'shop_level2',
            description:
                'role with permissions 10 max, maxStores, maxProducts, maxManagers, maxEmployees',
            permissions: {
                maxStores: 10,
                maxProducts: 10,
                maxManagers: 10,
                maxEmployees: 10,
            },
        });
        console.log('initial Setup: Default Roles Created');
    } else {
        console.log('initial Setup: Default Roles Already Exist');
    }
};
