import db from '@/app/lib/db';
import ServoLock from '@/models/ServoLock';
import User from '@/models/User';
import Order from '@/models/Order';
import Locker from '@/models/Locker';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  const servo_number = params.id;
  await db.connect();
  const servoLock = await ServoLock.findOne({ servo_number });
  const data = await req.json();
  const { userid, orderid, lockerid } = data;
  const user = await User.findOne({ _id: userid });
  const order = await Order.findOne({ _id: orderid });
  const locker = await Locker.findOne({ _id: lockerid });

  if (servoLock) {
    if (servoLock.status === 'open') {
      servoLock.status = 'close';
    } else {
      servoLock.status = 'open';
      order.isEnded = true;
      order.save();
      locker.status = 'vacant';
      locker.save();
      user.rentedLocker = null;
      user.save();
    }
    servoLock.save();
    await db.disconnect();
    if (servoLock.status === 'open') {
      return NextResponse.json(
        {
          message: 'Locker is successfully checked out.',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'Locker is now closed!' },
        { status: 200 }
      );
    }
  } else {
    return NextResponse.json(
      { message: 'ServoLock not found!' },
      { status: 404 }
    );
  }
}
