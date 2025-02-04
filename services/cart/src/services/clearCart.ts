import { INVENTORY_SERVICE } from '@/config';
import { redis } from '@/redis';
import axios from 'axios';

export const clearCart = async (id: string) => {
  try {
    const data = await redis.hgetall(`cart:${id}`);

    if (Object.keys(data).length === 0) {
      return;
    }

    const items = Object.keys(data).map((key) => {
      return {
        productId: key,
        ...JSON.parse(data[key]),
      };
    });

    // update the inventory
    const request = items.map((item) => {
      return axios.put(`${INVENTORY_SERVICE}/inventories/${item.inventoryId}`, {
        quantity: item.quantity,
        actionType: 'IN',
      });
    });

    Promise.all(request);
    console.log('Inventory updated');

    // clear the cart
    await redis.del(`cart:${id}`);

    // todo: bulk operation

  } catch (err) {
    console.error(err);
  }
};

