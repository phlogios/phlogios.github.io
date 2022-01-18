---
layout: post
title:  "Quaternions To Transformation Matrices"
date:   2022-01-18 10:59:00 +0100
categories: post
---

In my game engine, I've had an annoying bug for years. In some rare cases, when the camera aligned directly with an axis after having been rotated, everything failed to render for one frame. I thought it had something to do with my camera code, how I calculate a view matrix from a transformComponent's model matrix, but after looking for the cause for a few days I eventually put the bug on hold and just made sure the camera never aligned with that axis in my game.

Recently, I've been trying to solve another bug, where raycasts failed because there was an inverse relationship between the transformation matrix's scale and the apparent scale in the raycast test. When setting up a test case for this, with a spinning cube at the origin, I was distracted by a weird behavior in the rotation. It seemed to *snap* every once in a while, like if there was serious stuttering. Then I remembered the bug. This time, it wasn't the camera. The camera was fixed at a point a bit away from the origin and pointed towards the origin, but the cube was rotating around the Y axis. When the cube completed a full revolution, just passing 2*pi radians in rotation, the screen went black for 1 frame. Not just the cube disappeared - everything disappeared.

![alt text](/images/gameengine/raycast.png "A test scene where rays are cast towards a rotated cube.")

By debugging the rotation, I found that in the frame where everything went black, the quaternion of the cube had a _w_ value of less than -1. This didn't sit right with me and I vaguely remembered that the _w_ component is a cosine, so it should be in the range `-1 < w < 1`. When the quaternion was converted into a rotation matrix, I found the real problem. The matrix was all NaNs. What did I do wrong?

What I did wrong was I had guessed how quaternions are converted into matrices, and it was a naive, slow and stupid guess. This is how I did it:

```
localTransformationMatrix = glm::rotate(localTransformationMatrix, glm::angle(m_quaternion), glm::axis(m_quaternion));
```

I made a rotation matrix by using glm's angle-axis rotate function, where the angle was calculated from the quaternion with the `glm::angle` function, and the axis calculated calculated with the `glm::axis` function. This worked in most cases, but failed in this rare case.

There is a much simpler way to do this. Enter `glm::mat4_cast`, a function that correctly converts a quaternion to a 3x3 matrix, and then converts that to a 4x4 matrix by adding zeroes in the last column and row. This is how my code looks now:

```
localTransformationMatrix *= glm::mat4_cast(m_quaternion);
```

So how does glm do it? The version of glm my engine uses does this:
```
template <typename T, precision P>
	GLM_FUNC_QUALIFIER tmat3x3<T, P> mat3_cast(tquat<T, P> const & q)
	{
		tmat3x3<T, P> Result(T(1));
		T qxx(q.x * q.x);
		T qyy(q.y * q.y);
		T qzz(q.z * q.z);
		T qxz(q.x * q.z);
		T qxy(q.x * q.y);
		T qyz(q.y * q.z);
		T qwx(q.w * q.x);
		T qwy(q.w * q.y);
		T qwz(q.w * q.z);

		Result[0][0] = 1 - 2 * (qyy +  qzz);
		Result[0][1] = 2 * (qxy + qwz);
		Result[0][2] = 2 * (qxz - qwy);

		Result[1][0] = 2 * (qxy - qwz);
		Result[1][1] = 1 - 2 * (qxx +  qzz);
		Result[1][2] = 2 * (qyz + qwx);

		Result[2][0] = 2 * (qxz + qwy);
		Result[2][1] = 2 * (qyz - qwx);
		Result[2][2] = 1 - 2 * (qxx +  qyy);
		return Result;
	}
```
(Code courtesy of GLM by G-Truc Creation)

Simple, fast, and correct.